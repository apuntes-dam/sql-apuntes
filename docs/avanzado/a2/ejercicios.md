# SA2 · Ejercicios de CTE recursivas

<div class="ej-gate" data-unit="a2" data-nombre="A2 · CTE recursivas y jerarquías"></div>

Los ejercicios SA2.1 a SA2.4 usan la tabla `empleados` de la [página A2.1](01-arboles.md) y el SA2.6, la tabla `vuelos` de la [A2.2](02-grafos.md): **créalas primero** con sus scripts. El SA2.5 no necesita ninguna tabla. Escribe tú toda la solución.

## Ejercicio SA2.1

**El equipo de Marta.** Con la tabla `empleados`: `nombre` y `puesto` de **todas las personas que dependen de Marta** (`id = 3`), directa o indirectamente, sin incluir a Marta. Ordena por nombre.

Para crear la tabla:

```sql
CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
  id_jefe INTEGER REFERENCES empleados(id)   -- NULL en quien no tiene jefe
);
INSERT INTO empleados VALUES
  (1, 'Carmen', 'Directora',          5000, NULL),
  (2, 'Luis',   'Jefe de tecnología', 3800, 1),
  (3, 'Marta',  'Jefa de ventas',     3600, 1),
  (4, 'Pablo',  'Desarrollador',      2800, 2),
  (5, 'Sara',   'Desarrolladora',     2900, 2),
  (6, 'Iván',   'Comercial',          2300, 3),
  (7, 'Elena',  'Comercial',          2400, 3),
  (8, 'Raúl',   'Becario',            1200, 4),
  (9, 'Noa',    'Becaria',            1200, 6);
```

**Resultado esperado:**

| nombre | puesto |
|---|---|
| Elena | Comercial |
| Iván | Comercial |
| Noa | Becaria |

*3 filas*

<details class="sol" data-key="sql/a2/SA2.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA2.2

**La cadena de mando de Noa.** Con la tabla `empleados`: los **jefes de Noa**, de su jefe directo hacia arriba hasta la directora. Muestra `nivel` (`1` para su jefe directo, `2` para el jefe de su jefe...) y `nombre`. Ordena por nivel.

**Resultado esperado:**

| nivel | nombre |
|---|---|
| 1 | Iván |
| 2 | Marta |
| 3 | Carmen |

*3 filas*

<details class="sol" data-key="sql/a2/SA2.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA2.3

**El nivel de cada empleado.** Con la tabla `empleados`: `nombre` y `nivel` de cada empleado (`0` para quien no tiene jefe, `1` para sus subordinados directos...). Ordena por nivel y, dentro del mismo nivel, por nombre.

**Resultado esperado:**

| nombre | nivel |
|---|---|
| Carmen | 0 |
| Luis | 1 |
| Marta | 1 |
| Elena | 2 |
| Iván | 2 |
| Pablo | 2 |
| Sara | 2 |
| Noa | 3 |
| Raúl | 3 |

*9 filas*

<details class="sol" data-key="sql/a2/SA2.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA2.4

**El coste del equipo de Luis.** Con la tabla `empleados`: la **suma de los salarios** de Luis (`id = 2`) y de **todas las personas que dependen de él**, directa o indirectamente. Muestra una sola columna llamada `coste_equipo`.

**Resultado esperado:**

| coste_equipo |
|---|
| 10700 |

*1 fila*

<details class="sol" data-key="sql/a2/SA2.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA2.5

**Un calendario de cinco días.** Genera los días del **3 al 7 de marzo de 2025** (`dia`, en formato `AAAA-MM-DD`) y, junto a cada uno, `dia_semana` en texto: `lunes`, `martes`, `miércoles`, `jueves` o `viernes`. Usa una CTE recursiva y la función `strftime('%w', fecha)`, que da `0` para el domingo, `1` para el lunes, etc.

**Resultado esperado:**

| dia | dia_semana |
|---|---|
| 2025-03-03 | lunes |
| 2025-03-04 | martes |
| 2025-03-05 | miércoles |
| 2025-03-06 | jueves |
| 2025-03-07 | viernes |

*5 filas*

<details class="sol" data-key="sql/a2/SA2.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH RECURSIVE dias(dia) AS (
  SELECT '2025-03-03'
  UNION ALL
  SELECT date(dia, '+1 day') FROM dias WHERE dia &lt; '2025-03-07'
)
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA2.6

**Ciudades alcanzables desde Sevilla.** Con la tabla `vuelos`: todas las ciudades a las que se puede llegar **desde Sevilla** con uno o más vuelos. Usa `UNION` para que la recursión **termine** aunque haya ciclos. Ordena por ciudad.

Para crear la tabla:

```sql
CREATE TABLE vuelos (
  origen  TEXT NOT NULL,
  destino TEXT NOT NULL
);
INSERT INTO vuelos VALUES
  ('Cádiz', 'Sevilla'), ('Sevilla', 'Madrid'), ('Sevilla', 'Málaga'),
  ('Málaga', 'Madrid'), ('Madrid', 'Barcelona'), ('Barcelona', 'Cádiz');
```

**Resultado esperado:**

| ciudad |
|---|
| Barcelona |
| Cádiz |
| Madrid |
| Málaga |
| Sevilla |

*5 filas*

<details class="sol" data-key="sql/a2/SA2.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE vuelos (
  origen  TEXT NOT NULL,
  destino TEXT NOT NULL
);
INSERT INTO vuelos VALUES
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
