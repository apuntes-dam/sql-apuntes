# S6 · Ejercicios de SQL avanzado

<div class="ej-gate" data-unit="u06" data-nombre="U6 · SQL avanzado"></div>

Usa la base de datos del instituto, que **se restablece en cada ejercicio**. Escribe tú toda la solución, incluidas las sentencias de preparación (`CREATE VIEW`, `CREATE TRIGGER`...) y la consulta final.

## Ejercicio S6.1

**Calificaciones.** Para las notas de la convocatoria 1: `id_alumno`, `id_asignatura`, `nota` y una columna `calificacion` con `Suspenso` (menos de 5), `Aprobado` (de 5 a menos de 7), `Notable` (de 7 a menos de 9) o `Sobresaliente` (9 o más). Ordena de mayor a menor nota.

**Resultado esperado:**

| id_alumno | id_asignatura | nota | calificacion |
|---|---|---|---|
| 6 | 3 | 10.0 | Sobresaliente |
| 5 | 4 | 9.5 | Sobresaliente |
| 6 | 1 | 9.5 | Sobresaliente |
| 12 | 5 | 9.5 | Sobresaliente |
| 1 | 3 | 9.0 | Sobresaliente |
| 8 | 2 | 9.0 | Sobresaliente |
| … | … | … | … |

*46 filas* (se muestran 6)

<details class="sol" data-key="sql/u06/S6.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT id_alumno, id_asignatura, nota,
  CASE
    WHEN nota &gt;= 9 THEN 'Sobresaliente'
    WHEN nota &gt;= 7 THEN 'Notable'
    WHEN nota &gt;= 5 THEN 'Aprobado'
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.2

**Aprobados y suspensos por grupo.** Para cada **grupo** (su nombre), el número de notas **aprobadas** y **suspensas** de la convocatoria 1, en dos columnas. Ordena por nombre de grupo.

**Resultado esperado:**

| grupo | aprobadas | suspensas |
|---|---|---|
| 1DAM-A | 13 | 3 |
| 1DAM-B | 14 | 4 |
| 2DAM-A | 8 | 4 |

*3 filas*

<details class="sol" data-key="sql/u06/S6.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT g.nombre AS grupo,
       SUM(CASE WHEN n.nota &gt;= 5 THEN 1 ELSE 0 END) AS aprobadas,
       SUM(CASE WHEN n.nota &lt;  5 THEN 1 ELSE 0 END) AS suspensas
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.3

**Sin asignar.** Nombre de cada asignatura y el de su profesor, mostrando `Sin asignar` cuando no tiene. Ordena por nombre de asignatura.

**Resultado esperado:**

| asignatura | profesor |
|---|---|
| Bases de Datos | Pedro Salas |
| Entornos de Desarrollo | Lucía Ferrer |
| Inglés Técnico | Sin asignar |
| Lenguajes de Marcas | Lucía Ferrer |
| Programación | Marta Ruiz |
| Sistemas Informáticos | Hugo Navas |

*6 filas*

<details class="sol" data-key="sql/u06/S6.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, COALESCE(p.nombre, 'Sin asignar') AS profesor
FROM asignaturas s
LEFT JOIN profesores p ON p.id = s.id_profesor
ORDER BY s.nombre;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.4

**Una vista de expediente.** Crea la vista `expediente` con `alumno` (nombre y apellido juntos), `asignatura`, `convocatoria` y `nota`. Después, consúltala para ver las notas de **Marta Díaz** ordenadas por asignatura y convocatoria.

**Resultado esperado:**

| asignatura | convocatoria | nota |
|---|---|---|
| Bases de Datos | 1 | 8.0 |
| Entornos de Desarrollo | 1 | 8.0 |
| Lenguajes de Marcas | 1 | 7.0 |
| Programación | 1 | 8.0 |

*4 filas*

<details class="sol" data-key="sql/u06/S6.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE VIEW expediente AS
SELECT a.nombre || ' ' || a.apellido AS alumno, s.nombre AS asignatura, n.convocatoria, n.nota
FROM notas n
JOIN alumnos a     ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.5

**Una vista de medias.** Crea la vista `medias_alumno` con el `id`, el nombre completo y la **nota media** (2 decimales) de cada alumno **en la convocatoria 1**. Después, consúltala para ver los **tres** mejores.

**Resultado esperado:**

| alumno | media |
|---|---|
| Iván Torres | 8.5 |
| Marta Díaz | 7.75 |
| Raúl Campos | 7.67 |

*3 filas*

<details class="sol" data-key="sql/u06/S6.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE VIEW medias_alumno AS
SELECT a.id, a.nombre || ' ' || a.apellido AS alumno, ROUND(AVG(n.nota), 2) AS media
FROM alumnos a
JOIN notas n ON n.id_alumno = a.id
WHERE n.convocatoria = 1
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.6

**Un índice.** Crea un índice llamado `idx_notas_asignatura` sobre la columna `id_asignatura` de `notas` y comprueba con `EXPLAIN QUERY PLAN` que una búsqueda por `id_asignatura = 2` **lo usa**.

**Resultado esperado:**

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 62 | SEARCH notas USING INDEX idx_notas_asignatura (id_asignatura=?) |

*1 fila*

<details class="sol" data-key="sql/u06/S6.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE INDEX idx_notas_asignatura ON notas (id_asignatura);
EXPLAIN QUERY PLAN
SELECT nota FROM notas WHERE id_asignatura = 2;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.7

**Probar sin riesgo.** Dentro de una transacción, **borra todas las notas de la convocatoria 2** y, **sin confirmar**, deshaz el cambio. Comprueba que siguen existiendo las **57** notas.

**Resultado esperado:**

| notas |
|---|
| 57 |

*1 fila*

<details class="sol" data-key="sql/u06/S6.7">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>BEGIN;
DELETE FROM notas WHERE convocatoria = 2;
ROLLBACK;
SELECT COUNT(*) AS notas FROM notas;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.8

**Con WITH.** Usando una **CTE**, calcula el número de notas de cada alumno y muestra el nombre y apellido de los alumnos que tienen **más notas que la media** de notas por alumno. (Pista: solo cuentan los alumnos que tienen alguna nota.)

**Resultado esperado:**

| nombre | apellido | cuantas |
|---|---|---|
| Ana | Gil | 6 |
| Pablo | Núñez | 6 |
| Elena | Marín | 5 |
| Dani | Soto | 5 |
| Sara | Vega | 5 |

*5 filas*

<details class="sol" data-key="sql/u06/S6.8">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH por_alumno AS (
  SELECT id_alumno, COUNT(*) AS cuantas FROM notas GROUP BY id_alumno
)
SELECT a.nombre, a.apellido, p.cuantas
FROM por_alumno p
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.9

**Ranking.** Nombre completo y nota media (2 decimales) en la convocatoria 1 de cada alumno, con su **posición** en el ranking (`RANK`, de mayor a menor media). Muestra los **cinco primeros puestos**.

**Resultado esperado:**

| alumno | media | posicion |
|---|---|---|
| Iván Torres | 8.5 | 1 |
| Marta Díaz | 7.75 | 2 |
| Raúl Campos | 7.67 | 3 |
| Lola Ortiz | 7.5 | 4 |
| Sara Vega | 7.13 | 5 |

*5 filas*

<details class="sol" data-key="sql/u06/S6.9">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH medias AS (
  SELECT a.nombre || ' ' || a.apellido AS alumno, ROUND(AVG(n.nota), 2) AS media
  FROM alumnos a
  JOIN notas n ON n.id_alumno = a.id
  WHERE n.convocatoria = 1
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.10

**Un trigger de auditoría.** Crea la tabla `bajas_alumnos(id_alumno, nombre, apellido)` y un **trigger** que, **después de borrar** un alumno, guarde sus datos en esa tabla. Borra a la alumna **Irene Lara** (id 13, que no tiene notas) y muestra el contenido de `bajas_alumnos`.

**Resultado esperado:**

| id_alumno | nombre | apellido |
|---|---|---|
| 13 | Irene | Lara |

*1 fila*

<details class="sol" data-key="sql/u06/S6.10">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE bajas_alumnos (id_alumno INTEGER, nombre TEXT, apellido TEXT);
CREATE TRIGGER guardar_baja
AFTER DELETE ON alumnos
BEGIN
  INSERT INTO bajas_alumnos VALUES (OLD.id, OLD.nombre, OLD.apellido);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S6.11

⭐ **Reto: el mejor de cada grupo.** Para cada **grupo** (nombre), el **nombre completo** del alumno con **mejor nota media** en la convocatoria 1 y esa media. Usa `ROW_NUMBER()` con `PARTITION BY` dentro de una CTE.

**Resultado esperado:**

| grupo | alumno | media |
|---|---|---|
| 1DAM-A | Marta Díaz | 7.75 |
| 1DAM-B | Iván Torres | 8.5 |
| 2DAM-A | Raúl Campos | 7.67 |

*3 filas*

<details class="sol" data-key="sql/u06/S6.11">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>WITH medias AS (
  SELECT a.id_grupo, a.nombre || ' ' || a.apellido AS alumno, ROUND(AVG(n.nota), 2) AS media
  FROM alumnos a
  JOIN notas n ON n.id_alumno = a.id
  WHERE n.convocatoria = 1 AND a.id_grupo IS NOT NULL
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
