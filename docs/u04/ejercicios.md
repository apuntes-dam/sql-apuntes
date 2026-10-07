# S4 · Ejercicios de varias tablas

<div class="ej-gate" data-unit="u04" data-nombre="U4 · Varias tablas"></div>

Usa la base de datos del instituto. Antes de escribir cada consulta, piensa **qué tablas necesitas** y **por qué claves se unen**.

## Ejercicio S4.1

**Alumnos y su grupo.** Nombre, apellido y **nombre del grupo** de cada alumno, ordenados por grupo y, dentro de cada grupo, por apellido.

**Resultado esperado:**

| nombre | apellido | grupo |
|---|---|---|
| Marta | Díaz | 1DAM-A |
| Ana | Gil | 1DAM-A |
| Luis | Romero | 1DAM-A |
| Dani | Soto | 1DAM-A |
| Pablo | Núñez | 1DAM-B |
| Lola | Ortiz | 1DAM-B |
| … | … | … |

*13 filas* (se muestran 6)

<details class="sol" data-key="sql/u04/S4.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido, g.nombre AS grupo
FROM alumnos a
JOIN grupos g ON g.id = a.id_grupo
ORDER BY g.nombre, a.apellido;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.2

**Asignaturas y profesor.** Nombre de cada asignatura y **nombre de su profesor**, mostrando solo las asignaturas que **sí tienen** profesor.

**Resultado esperado:**

| asignatura | profesor |
|---|---|
| Programación | Marta Ruiz |
| Bases de Datos | Pedro Salas |
| Entornos de Desarrollo | Lucía Ferrer |
| Lenguajes de Marcas | Lucía Ferrer |
| Sistemas Informáticos | Hugo Navas |

*5 filas*

<details class="sol" data-key="sql/u04/S4.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, p.nombre AS profesor
FROM asignaturas s
JOIN profesores p ON p.id = s.id_profesor;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.3

**Notas de Bases de Datos.** Nombre y apellido de cada alumno y su nota en la **convocatoria 1** de la asignatura `Bases de Datos`, de la nota más alta a la más baja.

**Resultado esperado:**

| nombre | apellido | nota |
|---|---|---|
| Raúl | Campos | 9.0 |
| Iván | Torres | 8.5 |
| Marta | Díaz | 8.0 |
| Sara | Vega | 7.5 |
| Dani | Soto | 7.0 |
| Lola | Ortiz | 7.0 |
| … | … | … |

*13 filas* (se muestran 6)

<details class="sol" data-key="sql/u04/S4.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido, n.nota
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE s.nombre = 'Bases de Datos' AND n.convocatoria = 1
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.4

**Segundo curso.** Nombre y apellido de los alumnos del grupo `2DAM-A`.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Elena | Marín |
| Raúl | Campos |
| Noa | Prieto |
| Marcos | Peña |

*4 filas*

<details class="sol" data-key="sql/u04/S4.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido
FROM alumnos a
JOIN grupos g ON g.id = a.id_grupo
WHERE g.nombre = '2DAM-A';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.5

**Todas las asignaturas.** Nombre de **todas** las asignaturas y el de su profesor, incluidas las que **todavía no tienen** (en ese caso, el profesor saldrá vacío).

**Resultado esperado:**

| asignatura | profesor |
|---|---|
| Programación | Marta Ruiz |
| Bases de Datos | Pedro Salas |
| Entornos de Desarrollo | Lucía Ferrer |
| Lenguajes de Marcas | Lucía Ferrer |
| Sistemas Informáticos | Hugo Navas |
| Inglés Técnico | NULL |

*6 filas*

<details class="sol" data-key="sql/u04/S4.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, p.nombre AS profesor
FROM asignaturas s
LEFT JOIN profesores p ON p.id = s.id_profesor;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.6

**Todos los alumnos.** Nombre, apellido y grupo de **todos** los alumnos, también del que **no tiene grupo**.

**Resultado esperado:**

| nombre | apellido | grupo |
|---|---|---|
| Ana | Gil | 1DAM-A |
| Luis | Romero | 1DAM-A |
| Marta | Díaz | 1DAM-A |
| Pablo | Núñez | 1DAM-B |
| Sara | Vega | 1DAM-B |
| Iván | Torres | 1DAM-B |
| … | … | … |

*14 filas* (se muestran 6)

<details class="sol" data-key="sql/u04/S4.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido, g.nombre AS grupo
FROM alumnos a
LEFT JOIN grupos g ON g.id = a.id_grupo
ORDER BY a.id;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.7

**Sin notas.** Nombre y apellido de los alumnos que **no tienen ninguna nota** registrada.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Irene | Lara |

*1 fila*

<details class="sol" data-key="sql/u04/S4.7">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido
FROM alumnos a
LEFT JOIN notas n ON n.id_alumno = a.id
WHERE n.id_alumno IS NULL;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.8

**El expediente de una alumna.** Para la alumna con `id` 4: asignatura, convocatoria y nota, de todas sus notas, ordenadas por asignatura y convocatoria.

**Resultado esperado:**

| asignatura | convocatoria | nota |
|---|---|---|
| Bases de Datos | 1 | 3.5 |
| Bases de Datos | 2 | 6.5 |
| Entornos de Desarrollo | 1 | 6.0 |
| Lenguajes de Marcas | 1 | 8.5 |
| Programación | 1 | 4.5 |
| Programación | 2 | 7.0 |

*6 filas*

<details class="sol" data-key="sql/u04/S4.8">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, n.convocatoria, n.nota
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.id_alumno = 4
ORDER BY s.nombre, n.convocatoria;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.9

**Parejas de Sevilla.** Todas las **parejas de alumnos que viven en Sevilla** (nombre de cada uno), sin repetir ninguna pareja ni emparejar a nadie consigo mismo. (Una autounión.)

**Resultado esperado:**

| alumno_1 | alumno_2 |
|---|---|
| Luis | Dani |
| Luis | Sara |
| Luis | Álex |
| Sara | Dani |
| Sara | Álex |
| Dani | Álex |

*6 filas*

<details class="sol" data-key="sql/u04/S4.9">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre AS alumno_1, b.nombre AS alumno_2
FROM alumnos a
JOIN alumnos b ON b.ciudad = a.ciudad AND a.id &lt; b.id
WHERE a.ciudad = 'Sevilla';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.10

**Una lista de todos.** Una sola lista con el **nombre** de cada profesor (rol `profesor`) y el **nombre y apellido** de cada alumno (rol `alumno`), ordenada por rol y por nombre.

**Resultado esperado:**

| nombre | rol |
|---|---|
| Ana Gil | alumno |
| Dani Soto | alumno |
| Elena Marín | alumno |
| Irene Lara | alumno |
| Iván Torres | alumno |
| Lola Ortiz | alumno |
| … | … |

*18 filas* (se muestran 6)

<details class="sol" data-key="sql/u04/S4.10">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, 'profesor' AS rol FROM profesores
UNION
SELECT nombre || ' ' || apellido, 'alumno' FROM alumnos
ORDER BY rol, nombre;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.11

**Nunca suspendieron.** Los `id` de los alumnos que tienen **notas en la convocatoria 1** pero **ninguna menor de 5** (usa `EXCEPT`).

**Resultado esperado:**

| id_alumno |
|---|
| 2 |
| 3 |
| 6 |
| 8 |
| 11 |

*5 filas*

<details class="sol" data-key="sql/u04/S4.11">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT id_alumno FROM notas WHERE convocatoria = 1
EXCEPT
SELECT id_alumno FROM notas WHERE convocatoria = 1 AND nota &lt; 5
ORDER BY id_alumno;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S4.12

⭐ **Reto: quién suspendió y con quién.** Para cada nota **suspensa** (menor de 5) de la **convocatoria 1**: nombre y apellido del alumno, asignatura, nota y **profesor** de esa asignatura. Incluye las asignaturas sin profesor. Ordena por apellido.

**Resultado esperado:**

| nombre | apellido | asignatura | nota | profesor |
|---|---|---|---|---|
| Ana | Gil | Programación | 3.5 | Marta Ruiz |
| Ana | Gil | Lenguajes de Marcas | 3.0 | Lucía Ferrer |
| Elena | Marín | Bases de Datos | 3.0 | Pedro Salas |
| Elena | Marín | Inglés Técnico | 4.5 | NULL |
| Pablo | Núñez | Programación | 4.5 | Marta Ruiz |
| Pablo | Núñez | Bases de Datos | 3.5 | Pedro Salas |
| … | … | … | … | … |

*11 filas* (se muestran 6)

<details class="sol" data-key="sql/u04/S4.12">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido, s.nombre AS asignatura, n.nota, p.nombre AS profesor
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
LEFT JOIN profesores p ON p.id = s.id_profesor
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
