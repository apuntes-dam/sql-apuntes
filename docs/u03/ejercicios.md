# S3 · Ejercicios de crear y modificar

<div class="ej-gate" data-unit="u03" data-nombre="U3 · Crear y modificar datos"></div>

Parte de la base de datos del instituto, que **se restablece en cada ejercicio** (lo que cambies en uno no afecta al siguiente). Al final de cada solución hay un `SELECT` de comprobación que muestra el estado final.

## Ejercicio S3.1

**Crear una tabla.** Crea la tabla `clubes` con: `id` (clave primaria numerada), `nombre` (obligatorio y único), `cuota` (decimal, obligatorio, 0 por defecto y nunca negativa) y `id_profesor` (clave foránea opcional a `profesores`). Después, lista las tablas de la base de datos.

**Resultado esperado:**

| tabla |
|---|
| alumnos |
| asignaturas |
| clubes |
| grupos |
| notas |
| profesores |
| … |

*7 filas* (se muestran 6)

<details class="sol" data-key="sql/u03/S3.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE clubes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,
  cuota       REAL NOT NULL DEFAULT 0 CHECK (cuota &gt;= 0),
  id_profesor INTEGER REFERENCES profesores(id)
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.2

**Una alumna nueva.** Inserta a **Paula Rey**, nacida el 5 de mayo de 2005, de **Cádiz**, en el **grupo 1**. Indica las columnas. Comprueba que se ha creado.

**Resultado esperado:**

| id | nombre | apellido | id_grupo |
|---|---|---|---|
| 15 | Paula | Rey | 1 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>INSERT INTO alumnos (nombre, apellido, nacimiento, ciudad, id_grupo)
VALUES ('Paula', 'Rey', '2005-05-05', 'Cádiz', 1);
SELECT id, nombre, apellido, id_grupo FROM alumnos WHERE nombre = 'Paula';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.3

**Varias a la vez.** Inserta **en una sola sentencia** dos asignaturas nuevas: `Robótica` (60 horas, sin profesor) y `Diseño de Interfaces` (100 horas, profesor 3). Muestra las asignaturas con `id` mayor que 6.

**Resultado esperado:**

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 7 | Robótica | 60 | NULL |
| 8 | Diseño de Interfaces | 100 | 3 |

*2 filas*

<details class="sol" data-key="sql/u03/S3.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>INSERT INTO asignaturas (nombre, horas, id_profesor) VALUES
  ('Robótica', 60, NULL),
  ('Diseño de Interfaces', 100, 3);
SELECT * FROM asignaturas WHERE id &gt; 6;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.4

**Subir notas.** Suma **medio punto** a todas las notas de la **convocatoria 2** de la asignatura 4 (`Lenguajes de Marcas`), sin que ninguna pase de 10. Comprueba el resultado.

**Resultado esperado:**

| id_alumno | nota |
|---|---|
| 1 | 4.5 |
| 10 | 6.0 |

*2 filas*

<details class="sol" data-key="sql/u03/S3.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>UPDATE notas SET nota = MIN(nota + 0.5, 10) WHERE id_asignatura = 4 AND convocatoria = 2;
SELECT id_alumno, nota FROM notas WHERE id_asignatura = 4 AND convocatoria = 2;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.5

**Asignar un profesor.** La asignatura `Inglés Técnico` no tiene profesor. Asígnale el profesor 1 y comprueba el cambio.

**Resultado esperado:**

| nombre | id_profesor |
|---|---|
| Inglés Técnico | 1 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>UPDATE asignaturas SET id_profesor = 1 WHERE nombre = 'Inglés Técnico';
SELECT nombre, id_profesor FROM asignaturas WHERE nombre = 'Inglés Técnico';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.6

**Asignar un grupo.** La alumna **Irene Lara** no tiene grupo. Ponla en el **grupo 3** y comprueba el cambio.

**Resultado esperado:**

| nombre | apellido | id_grupo |
|---|---|---|
| Irene | Lara | 3 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>UPDATE alumnos SET id_grupo = 3 WHERE nombre = 'Irene' AND apellido = 'Lara';
SELECT nombre, apellido, id_grupo FROM alumnos WHERE nombre = 'Irene';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.7

**Borrar notas.** Borra todas las notas de la **convocatoria 2** que sean **menores de 5**. Muestra cuántas notas quedan.

**Resultado esperado:**

| notas_restantes |
|---|
| 54 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.7">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>DELETE FROM notas WHERE convocatoria = 2 AND nota &lt; 5;
SELECT COUNT(*) AS notas_restantes FROM notas;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.8

**Borrar un alumno con sus notas.** Borra al alumno **Álex Roca** (id 14). Tiene notas, así que **la base de datos no te dejará borrarlo directamente**: piensa en qué orden hacerlo. Comprueba que ya no está.

**Resultado esperado:**

| alumnos_restantes |
|---|
| 13 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.8">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>DELETE FROM notas WHERE id_alumno = 14;
DELETE FROM alumnos WHERE id = 14;
SELECT COUNT(*) AS alumnos_restantes FROM alumnos;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.9

**Añadir una columna.** Añade a `alumnos` la columna `email` (texto) y rellénala para **todos los alumnos** con `alumno` seguido de su `id` y `@instituto.es` (por ejemplo, `alumno1@instituto.es`). Muestra los 3 primeros.

**Resultado esperado:**

| id | nombre | email |
|---|---|---|
| 1 | Ana | alumno1@instituto.es |
| 2 | Luis | alumno2@instituto.es |
| 3 | Marta | alumno3@instituto.es |

*3 filas*

<details class="sol" data-key="sql/u03/S3.9">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>ALTER TABLE alumnos ADD COLUMN email TEXT;
UPDATE alumnos SET email = 'alumno' || id || '@instituto.es';
SELECT id, nombre, email FROM alumnos ORDER BY id LIMIT 3;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.10

**Copiar el resultado de una consulta.** Crea la tabla `suspensos` con las columnas `id_alumno`, `id_asignatura` y `nota` de las notas de la **convocatoria 1 menores de 5**. Muestra cuántas filas tiene.

**Resultado esperado:**

| filas |
|---|
| 11 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.10">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE suspensos AS
SELECT id_alumno, id_asignatura, nota FROM notas WHERE convocatoria = 1 AND nota &lt; 5;
SELECT COUNT(*) AS filas FROM suspensos;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.11

**Borrado en cascada.** Crea la tabla `faltas` con `id` (clave primaria numerada), `id_alumno` (clave foránea a `alumnos` con **borrado en cascada**) y `fecha`. Inserta dos faltas de la alumna **Irene Lara** (id 13: `2025-10-01` y `2025-10-02`), bórrala y comprueba que **sus faltas han desaparecido**.

**Resultado esperado:**

| faltas_restantes |
|---|
| 0 |

*1 fila*

<details class="sol" data-key="sql/u03/S3.11">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE faltas (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  id_alumno INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha     TEXT    NOT NULL
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S3.12

⭐ **Reto: duplicar con `INSERT ... SELECT`.** Crea una asignatura nueva llamada `Inglés Técnico II` con **las mismas horas y el mismo profesor** que `Inglés Técnico`, sin escribir esos valores a mano (usa `INSERT ... SELECT`). Muestra las asignaturas con `id` mayor que 6.

**Resultado esperado:**

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 7 | Inglés Técnico II | 60 | NULL |

*1 fila*

<details class="sol" data-key="sql/u03/S3.12">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>INSERT INTO asignaturas (nombre, horas, id_profesor)
SELECT nombre || ' II', horas, id_profesor FROM asignaturas WHERE nombre = 'Inglés Técnico';
SELECT * FROM asignaturas WHERE id &gt; 6;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
