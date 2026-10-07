# SA1 · Ejercicios de ventanas a fondo

<div class="ej-gate" data-unit="a1" data-nombre="A1 · Ventanas a fondo"></div>

Los ejercicios SA1.1, SA1.2, SA1.3 y SA1.6 usan la tabla `ventas` de la [página A1.1](01-marcos.md). **Créala primero** con su script; los demás usan la base de datos del instituto, que **se restablece en cada ejercicio**. Escribe tú toda la solución, incluidas las sentencias de preparación.

## Ejercicio SA1.1

**Ventas acumuladas.** Con la tabla `ventas`: `mes`, `importe` y una columna `acumulado` con la suma de las ventas desde enero hasta ese mes.

Para crear la tabla:

```sql
CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
  ('2025-01', 1200), ('2025-02', 1500), ('2025-03', 1100), ('2025-04', 1800),
  ('2025-05', 1700), ('2025-06', 2100), ('2025-07', 1900), ('2025-08', 2400);
```

**Resultado esperado:**

| mes | importe | acumulado |
|---|---|---|
| 2025-01 | 1200 | 1200 |
| 2025-02 | 1500 | 2700 |
| 2025-03 | 1100 | 3800 |
| 2025-04 | 1800 | 5600 |
| 2025-05 | 1700 | 7300 |
| 2025-06 | 2100 | 9400 |
| 2025-07 | 1900 | 11300 |
| 2025-08 | 2400 | 13700 |

*8 filas*

<details class="sol" data-key="sql/a1/SA1.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA1.2

**Media de dos meses.** Con la tabla `ventas`: `mes`, `importe` y `media_2_meses`, la media del importe **del mes y el anterior**, redondeada a **1 decimal**. En enero solo hay un mes, así que su media es el propio importe.

**Resultado esperado:**

| mes | importe | media_2_meses |
|---|---|---|
| 2025-01 | 1200 | 1200.0 |
| 2025-02 | 1500 | 1350.0 |
| 2025-03 | 1100 | 1300.0 |
| 2025-04 | 1800 | 1450.0 |
| 2025-05 | 1700 | 1750.0 |
| 2025-06 | 2100 | 1900.0 |
| 2025-07 | 1900 | 2000.0 |
| 2025-08 | 2400 | 2150.0 |

*8 filas*

<details class="sol" data-key="sql/a1/SA1.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA1.3

**Meses en los que se vendió menos.** Con la tabla `ventas`: los meses en que el importe **bajó** respecto al mes anterior. Muestra `mes`, `importe` y `mes_anterior` (el importe del mes anterior).

**Resultado esperado:**

| mes | importe | mes_anterior |
|---|---|---|
| 2025-03 | 1100 | 1500 |
| 2025-05 | 1700 | 1800 |
| 2025-07 | 1900 | 2100 |

*3 filas*

<details class="sol" data-key="sql/a1/SA1.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA1.4

**Los dos mejores de cada asignatura.** Para la convocatoria 1: `asignatura` (su nombre), `nombre` del alumno y `nota` de los **dos mejores** de cada asignatura. Si hay empate, desempata por el `id` del alumno (el menor primero) para que salgan **exactamente dos** por asignatura. Ordena por asignatura y por nota descendente.

**Resultado esperado:**

| asignatura | nombre | nota |
|---|---|---|
| Bases de Datos | Raúl | 9.0 |
| Bases de Datos | Iván | 8.5 |
| Entornos de Desarrollo | Iván | 10.0 |
| Entornos de Desarrollo | Ana | 9.0 |
| Inglés Técnico | Raúl | 6.5 |
| Inglés Técnico | Marcos | 6.0 |
| Lenguajes de Marcas | Sara | 9.5 |
| Lenguajes de Marcas | Lola | 9.0 |
| Programación | Iván | 9.5 |
| Programación | Marta | 8.0 |
| Sistemas Informáticos | Marcos | 9.5 |
| Sistemas Informáticos | Raúl | 7.5 |

*12 filas*

<details class="sol" data-key="sql/a1/SA1.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH r AS (
  SELECT s.nombre AS asignatura, a.nombre, n.nota,
         ROW_NUMBER() OVER (
           PARTITION BY n.id_asignatura
           ORDER BY n.nota DESC, a.id
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA1.5

**Cuartiles de Bases de Datos.** Reparte en 4 cuartiles las notas de **Bases de Datos** (asignatura 2, convocatoria 1), del 1 para las notas más altas al 4 para las más bajas. Muestra, para cada `cuartil`, **cuántas notas** tiene (`notas`), la **mínima** (`minima`) y la **máxima** (`maxima`). Ordena por cuartil.

**Resultado esperado:**

| cuartil | notas | minima | maxima |
|---|---|---|---|
| 1 | 4 | 7.5 | 9.0 |
| 2 | 3 | 6.5 | 7.0 |
| 3 | 3 | 3.5 | 6.0 |
| 4 | 3 | 2.5 | 3.0 |

*4 filas*

<details class="sol" data-key="sql/a1/SA1.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH c AS (
  SELECT nota, NTILE(4) OVER (ORDER BY nota DESC) AS cuartil
  FROM notas
  WHERE id_asignatura = 2 AND convocatoria = 1
)
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA1.6

**Cuánto falta para el mejor mes.** Con la tabla `ventas`: `mes`, `importe` y `falta_para_el_mejor`, la diferencia entre el **importe del mejor mes** y el de ese mes (el mejor mes tiene `0`). Ordena de mayor a menor importe.

**Resultado esperado:**

| mes | importe | falta_para_el_mejor |
|---|---|---|
| 2025-08 | 2400 | 0 |
| 2025-06 | 2100 | 300 |
| 2025-07 | 1900 | 500 |
| 2025-04 | 1800 | 600 |
| 2025-05 | 1700 | 700 |
| 2025-02 | 1500 | 900 |
| 2025-01 | 1200 | 1200 |
| 2025-03 | 1100 | 1300 |

*8 filas*

<details class="sol" data-key="sql/a1/SA1.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
