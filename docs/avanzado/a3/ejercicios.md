# SA3 · Ejercicios de rendimiento

<div class="ej-gate" data-unit="a3" data-nombre="A3 · Rendimiento y planes de ejecución"></div>

Todos los ejercicios usan la tabla `pedidos` de la [página A3.1](01-plan.md) (50 000 filas). **Créala primero** con este script; en cada ejercicio la base de datos **parte de cero**. Escribe tú toda la solución, incluidas las sentencias de preparación. Los nombres de los índices se indican en el enunciado, porque aparecen en el plan.

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

## Ejercicio SA3.1

**Un índice por cliente.** Crea un índice llamado `idx_pedidos_cliente` sobre `id_cliente` y muestra el **plan de ejecución** de `SELECT * FROM pedidos WHERE id_cliente = 42`. Debe aparecer una búsqueda con el índice, no un recorrido de la tabla.

**Resultado esperado:**

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 61 | SEARCH pedidos USING INDEX idx_pedidos_cliente (id_cliente=?) |

*1 fila*

<details class="sol" data-key="sql/a3/SA3.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA3.2

**Un índice compuesto.** Crea un índice llamado `idx_cliente_fecha` sobre `(id_cliente, fecha)` y muestra el **plan de ejecución** de `SELECT * FROM pedidos WHERE id_cliente = 42 AND fecha >= '2024-06-01'`. El plan debe usar las **dos** columnas del índice.

**Resultado esperado:**

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 51 | SEARCH pedidos USING INDEX idx_cliente_fecha (id_cliente=? AND fecha>?) |

*1 fila*

<details class="sol" data-key="sql/a3/SA3.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA3.3

**Un índice de cobertura.** Crea un índice llamado `idx_cliente_importe` sobre `(id_cliente, importe)` y muestra el **plan de ejecución** de `SELECT SUM(importe) FROM pedidos WHERE id_cliente = 42`. El plan debe indicar que se resuelve **solo con el índice**.

**Resultado esperado:**

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 53 | SEARCH pedidos USING COVERING INDEX idx_cliente_importe (id_cliente=?) |

*1 fila*

<details class="sol" data-key="sql/a3/SA3.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA3.4

**Los pedidos de marzo, bien escrito.** Crea un índice llamado `idx_pedidos_fecha` sobre `fecha` y cuenta cuántos pedidos hay en **marzo de 2024** (`pedidos_de_marzo`) con una condición que **pueda usar el índice** (nada de funciones sobre la columna).

**Resultado esperado:**

| pedidos_de_marzo |
|---|
| 4247 |

*1 fila*

<details class="sol" data-key="sql/a3/SA3.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA3.5

**Las estadísticas de un índice.** Crea un índice llamado `idx_pedidos_cliente` sobre `id_cliente`, ejecuta `ANALYZE` y muestra las columnas `tbl`, `idx` y `stat` de la tabla `sqlite_stat1` **solo para ese índice**. Fíjate en cuántas filas hay de media por cliente.

**Resultado esperado:**

| tbl | idx | stat |
|---|---|---|
| pedidos | idx_pedidos_cliente | 50000 25 |

*1 fila*

<details class="sol" data-key="sql/a3/SA3.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA3.6

**La página siguiente.** Se han mostrado los pedidos hasta el `id` 40000 y el usuario pide **la página siguiente de 5 pedidos**. Muestra `id`, `id_cliente` e `importe` de esos 5 con **paginación por clave** (sin `OFFSET`), ordenados por `id`.

**Resultado esperado:**

| id | id_cliente | importe |
|---|---|---|
| 40001 | 1920 | 21 |
| 40002 | 1839 | 52 |
| 40003 | 1758 | 83 |
| 40004 | 1677 | 24 |
| 40005 | 1596 | 55 |

*5 filas*

<details class="sol" data-key="sql/a3/SA3.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  producto   TEXT    NOT NULL,
  importe    INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
