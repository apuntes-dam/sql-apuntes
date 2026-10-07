# A3.1 Leer el plan de ejecución

!!! info "Para quién es esto"
    Es material **avanzado**. Da por sabido qué es un índice, de la [unidad 6](../../u06/03-indices.md).

## Una tabla grande para notar la diferencia

Para ver qué cambia con y sin índice hace falta una tabla con **muchas filas**. Esta tiene **50 000 pedidos** (los datos son ficticios y se generan con una CTE recursiva). Para reproducir los ejemplos, ejecuta antes:

```sql
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
  fecha      TEXT    NOT NULL
);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 50000)
INSERT INTO pedidos
SELECT i,
       (i * 7919) % 2000 + 1,
       CASE i % 4 WHEN 0 THEN 'café' WHEN 1 THEN 'té' WHEN 2 THEN 'zumo' ELSE 'tarta' END,
       (i * 31) % 90 + 10,
       date('2024-01-01', '+' || (i % 365) || ' days')
FROM n;
```

## EXPLAIN QUERY PLAN

Delante de cualquier consulta, **`EXPLAIN QUERY PLAN`** no la ejecuta: **cuenta cómo la ejecutaría**. El resultado trae varias columnas, pero la que importa es **`detail`** (`notused` no significa nada y puede cambiar según la versión). En otros motores se llama `EXPLAIN` (MySQL, PostgreSQL) o `EXPLAIN PLAN` (Oracle), y la salida es distinta, pero la idea es la misma.

Los pedidos del cliente 42, **sin ningún índice**:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE id_cliente = 42;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 2 | 0 | 216 | SCAN pedidos |

*1 fila*

`SCAN pedidos` significa **recorrer la tabla entera**, fila a fila, para ver cuáles son del cliente 42. Con 50 000 filas es soportable; con 50 millones, no.

## SEARCH: ir directo

Buscar por la **clave primaria** no necesita crear nada, porque la clave ya tiene su propia estructura:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE id = 42;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 2 | 0 | 33 | SEARCH pedidos USING INTEGER PRIMARY KEY (rowid=?) |

*1 fila*

Y si creamos un índice sobre `id_cliente`, el plan de la consulta de antes **cambia**:

```sql
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE id_cliente = 42;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 61 | SEARCH pedidos USING INDEX idx_pedidos_cliente (id_cliente=?) |

*1 fila*

Ahora dice `SEARCH ... USING INDEX idx_pedidos_cliente (id_cliente=?)`: va **directamente** a las filas del cliente 42, sin mirar las demás. La consulta es la misma; solo ha cambiado **cómo se ejecuta**.

## Cómo se lee un plan

| Lo que dice el plan | Qué significa |
|---|---|
| `SCAN tabla` | **Recorre toda la tabla**: lo más caro |
| `SEARCH tabla USING INTEGER PRIMARY KEY (rowid=?)` | Busca **por la clave primaria**: muy rápido |
| `SEARCH tabla USING INDEX nombre (col=?)` | Busca **por un índice**: rápido |
| `USING COVERING INDEX` | El índice **contiene todas las columnas** que se piden: ni siquiera mira la tabla |
| `SCAN tabla USING INDEX` | Recorre **el índice entero** (en orden), no la tabla: mejor que lo primero, pero sigue siendo recorrer todo |
| `USE TEMP B-TREE FOR ORDER BY` / `FOR GROUP BY` | Tiene que **ordenar o agrupar aparte**, en una estructura temporal |
| `AUTOMATIC INDEX` | Ha creado un índice **temporal** solo para esta consulta: señal de que falta uno de verdad |

La regla práctica: **`SEARCH` es lo que quieres ver** en las consultas que se repiten mucho y sobre tablas grandes. Un `SCAN` no siempre es un problema: sobre una tabla de 20 filas, da igual.

## Índices de cobertura

Si el índice **contiene todas las columnas** que la consulta necesita, la base de datos **no necesita mirar la tabla**. Con un índice sobre `(id_cliente, importe)`, sumar los importes de un cliente se resuelve solo con el índice:

```sql
CREATE INDEX idx_cliente_importe ON pedidos(id_cliente, importe);
EXPLAIN QUERY PLAN
SELECT SUM(importe) FROM pedidos WHERE id_cliente = 42;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 53 | SEARCH pedidos USING COVERING INDEX idx_cliente_importe (id_cliente=?) |

*1 fila*

`COVERING INDEX` es lo más rápido que puede hacer: lee el índice, que es mucho más pequeño que la tabla, y termina.

## Ordenar y agrupar

Agrupar u ordenar por una columna **sin índice** obliga a montar una estructura temporal:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM pedidos ORDER BY importe LIMIT 5;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 4 | 0 | 216 | SCAN pedidos |
| 19 | 0 | 0 | USE TEMP B-TREE FOR ORDER BY |

*2 filas*

`USE TEMP B-TREE FOR ORDER BY` significa que **ordena las 50 000 filas** para quedarse con cinco. Con un índice sobre `importe`, las filas ya están en orden dentro del índice: lee **las cinco primeras** y termina, sin ordenar nada:

```sql
CREATE INDEX idx_pedidos_importe ON pedidos(importe);
EXPLAIN QUERY PLAN
SELECT * FROM pedidos ORDER BY importe LIMIT 5;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 5 | 0 | 223 | SCAN pedidos USING INDEX idx_pedidos_importe |

*1 fila*

## Los JOIN

Con dos tablas, el plan dice **cómo busca cada una**. Aquí se une cada pedido con su cliente (y los clientes tienen su clave primaria). Para reproducirlo, crea antes también esta tabla:

```sql
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL
);
WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 2000)
INSERT INTO clientes
SELECT i, 'Cliente ' || i, CASE i % 3 WHEN 0 THEN 'Cádiz' WHEN 1 THEN 'Sevilla' ELSE 'Málaga' END
FROM n;
```

```sql
EXPLAIN QUERY PLAN
SELECT c.nombre, p.importe
FROM pedidos p
JOIN clientes c ON c.id = p.id_cliente
WHERE p.id = 10;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 45 | SEARCH p USING INTEGER PRIMARY KEY (rowid=?) |
| 6 | 0 | 45 | SEARCH c USING INTEGER PRIMARY KEY (rowid=?) |

*2 filas*

Son **dos `SEARCH` por clave primaria**: uno para el pedido 10 y otro para su cliente. Un `JOIN` es rápido cuando **la columna por la que se une tiene índice** (aquí, la clave primaria de `clientes`); cuando no lo tiene, es donde aparece `AUTOMATIC INDEX`.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Optimizar **sin medir** | Mira primero el plan: el cuello de botella casi nunca está donde se piensa |
| Crear un índice por cada columna «por si acaso» | Cada índice **ralentiza** los `INSERT`, `UPDATE` y `DELETE` y ocupa espacio: solo los que usan tus consultas |
| Creer que `SCAN` es siempre malo | Importa **el tamaño de la tabla** y **cuántas veces** se ejecuta la consulta |
| Fiarse de un plan con pocos datos | El plan puede cambiar cuando la tabla crece: prueba con datos parecidos a los reales |
| Comparar planes de motores distintos | Cada motor tiene su propio formato y sus propias decisiones |

## Para practicar

Los ejercicios SA3.1, SA3.2 y SA3.3 de [SA3 · Ejercicios](ejercicios.md) piden crear índices y comprobar el plan.
