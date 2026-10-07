# A3.2 Índices a fondo y consultas lentas

Esta página usa la tabla `pedidos` de [A3.1](01-plan.md), con las 50 000 filas, y su script de creación.

## Índices con varias columnas: el orden importa

Un índice sobre `(id_cliente, fecha)` funciona como una **agenda ordenada primero por cliente y, dentro de cada cliente, por fecha**. Eso decide **qué consultas puede acelerar**. Con ese único índice:

**Filtrando por las dos columnas**, usa el índice completo:

```sql
CREATE INDEX idx_cliente_fecha ON pedidos(id_cliente, fecha);
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE id_cliente = 42 AND fecha >= '2024-06-01';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 51 | SEARCH pedidos USING INDEX idx_cliente_fecha (id_cliente=? AND fecha>?) |

*1 fila*

**Filtrando solo por la primera columna**, también le sirve (es como buscar en la agenda solo por el apellido):

```sql
CREATE INDEX idx_cliente_fecha ON pedidos(id_cliente, fecha);
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE id_cliente = 42;
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 62 | SEARCH pedidos USING INDEX idx_cliente_fecha (id_cliente=?) |

*1 fila*

**Filtrando solo por la segunda columna**, **no le sirve**: en una agenda ordenada por apellido, buscar por nombre obliga a leerla toda:

```sql
CREATE INDEX idx_cliente_fecha ON pedidos(id_cliente, fecha);
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE fecha = '2024-06-01';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 2 | 0 | 216 | SCAN pedidos |

*1 fila*

La regla: un índice compuesto sirve para las consultas que filtran por **sus primeras columnas, en orden** (`(a)`, `(a, b)`...), pero no para las que se saltan la primera. Por eso se pone **primero la columna que más se usa en igualdad** (`=`) y **después** las de rangos (`>`, `<`).

## Consultas que no pueden usar el índice

Un índice sobre `fecha` ordena las fechas **tal cual están guardadas**. Si en el `WHERE` **transformas la columna** con una función, la base de datos ya no puede buscar en el índice, porque lo que compara es otra cosa. Contar los pedidos de marzo de 2024, de dos formas:

**Con una función sobre la columna** (`substr`):

```sql
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM pedidos WHERE substr(fecha, 1, 7) = '2024-03';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 213 | SCAN pedidos USING COVERING INDEX idx_pedidos_fecha |

*1 fila*

**Con un rango sobre la columna**, que dice lo mismo sin tocarla:

```sql
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
EXPLAIN QUERY PLAN
SELECT COUNT(*) FROM pedidos
WHERE fecha >= '2024-03-01' AND fecha < '2024-04-01';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 153 | SEARCH pedidos USING COVERING INDEX idx_pedidos_fecha (fecha>? AND fecha<?) |

*1 fila*

La primera **recorre el índice entero** (`SCAN ... USING COVERING INDEX`: las 50 000 entradas) y la segunda **va directamente al rango** (`SEARCH ... (fecha>? AND fecha<?)`). Las dos devuelven el mismo número de pedidos:

```sql
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
SELECT COUNT(*) AS pedidos_de_marzo FROM pedidos
WHERE fecha >= '2024-03-01' AND fecha < '2024-04-01';
```

Resultado:

| pedidos_de_marzo |
|---|
| 4247 |

*1 fila*

A las consultas que sí pueden aprovechar un índice se les llama **sargables** (del inglés *SARG-able*, «argumento de búsqueda»). Lo que las rompe:

| Rompe el índice | Alternativa |
|---|---|
| Una **función** sobre la columna (`substr(fecha, 1, 7) = ...`, `LOWER(nombre) = ...`) | Un **rango** sobre la columna, o guardar el dato ya transformado |
| Una **operación** sobre la columna (`importe * 2 > 100`) | Pasa la operación al otro lado: `importe > 50` |
| `LIKE '%texto'` (comodín **al principio**) | Ninguno sencillo: ningún índice ordenado ayuda a buscar «lo que acaba en» |

Un `LIKE` con el comodín al principio siempre recorre la tabla entera:

```sql
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE producto LIKE '%fé';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 2 | 0 | 216 | SCAN pedidos |

*1 fila*

## Las estadísticas: ANALYZE

Para decidir entre dos formas de ejecutar una consulta, el motor necesita saber **cómo son los datos**: cuántas filas hay y cuántas se repiten por cada valor. Eso lo guarda **`ANALYZE`**, en una tabla del propio sistema:

```sql
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
ANALYZE;
SELECT tbl, idx, stat FROM sqlite_stat1 ORDER BY idx;
```

Resultado:

| tbl | idx | stat |
|---|---|---|
| pedidos | idx_pedidos_cliente | 50000 25 |
| pedidos | idx_pedidos_fecha | 50000 137 |

*2 filas*

Cada `stat` son números: el primero es el **total de filas**; los siguientes, **cuántas filas coinciden de media** con cada valor de la primera columna del índice. `idx_pedidos_cliente` dice `50000 25`: 50 000 filas y **unas 25 por cliente**; `idx_pedidos_fecha` dice `137`: **unas 137 por fecha**. Con estos números el motor sabe que buscar por cliente devuelve pocas filas y que **merece la pena** usar el índice. En otros motores el equivalente es `ANALYZE` (PostgreSQL, MySQL) o las estadísticas del optimizador (Oracle, SQL Server).

## Paginar bien

Una web que muestra los pedidos de **cinco en cinco** necesita saltar a una página concreta. La forma habitual es `LIMIT` con `OFFSET`:

```sql
SELECT id, id_cliente, importe FROM pedidos ORDER BY id LIMIT 5 OFFSET 40000;
```

Funciona, pero **la base de datos tiene que recorrer y descartar las 40 000 filas anteriores** para llegar a la página. Cuanto más avanzas, más tarda. La alternativa, la **paginación por clave**, recuerda **el último `id` visto** y pide «los siguientes»:

```sql
SELECT id, id_cliente, importe
FROM pedidos
WHERE id > 40000
ORDER BY id
LIMIT 5;
```

Resultado:

| id | id_cliente | importe |
|---|---|---|
| 40001 | 1920 | 21 |
| 40002 | 1839 | 52 |
| 40003 | 1758 | 83 |
| 40004 | 1677 | 24 |
| 40005 | 1596 | 55 |

*5 filas*

Da **exactamente la misma página**, pero **va directamente a la posición** por la clave primaria, con el mismo coste en la página 1 que en la 8000. Su limitación: solo permite pasar a la página **siguiente** (o anterior), no saltar a una cualquiera.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Poner una columna que **no se filtra por igualdad primero** en el índice compuesto | Primero las de `=`, luego las de rango |
| Un índice sobre `fecha` y filtrar con `substr(fecha, ...)` o `strftime(...)` | Filtra con un **rango** sobre la columna |
| `LIKE '%texto'` esperando que use el índice | No puede: busca otro enfoque (búsqueda de texto completo) |
| Olvidar `ANALYZE` en una tabla que ha cambiado mucho | Actualiza las estadísticas tras cargas grandes |
| Paginar con `OFFSET` enormes | Paginación por clave |
| Un índice **de más** para cada consulta distinta | Mira cuáles usan **de verdad** tus consultas frecuentes y borra el resto |

## Para practicar

Los ejercicios SA3.4, SA3.5 y SA3.6 de [SA3 · Ejercicios](ejercicios.md) usan rangos, estadísticas y paginación por clave.
