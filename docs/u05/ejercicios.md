# S5 · Ejercicios de agrupar y subconsultas

<div class="ej-gate" data-unit="u05" data-nombre="U5 · Agrupar y subconsultas"></div>

Usa la base de datos del instituto. Recuerda: el `WHERE` filtra **filas** antes de agrupar y el `HAVING` filtra **grupos** después.

## Ejercicio S5.1

**Contar.** En una sola consulta: el **número de alumnos** (`alumnos`) y el **número de alumnos con grupo** (`con_grupo`).

**Resultado esperado:**

| alumnos | con_grupo |
|---|---|
| 14 | 13 |

*1 fila*

<details class="sol" data-key="sql/u05/S5.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT COUNT(*) AS alumnos, COUNT(id_grupo) AS con_grupo FROM alumnos;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.2

**Resumen de notas.** Nota **mínima**, **máxima** y **media** (con 2 decimales) de las notas de la **convocatoria 1**.

**Resultado esperado:**

| minima | maxima | media |
|---|---|---|
| 2.5 | 10.0 | 6.45 |

*1 fila*

<details class="sol" data-key="sql/u05/S5.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT MIN(nota) AS minima, MAX(nota) AS maxima, ROUND(AVG(nota), 2) AS media FROM notas WHERE convocatoria = 1;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.3

**Alumnos por ciudad.** Cada ciudad con su número de alumnos, de más a menos alumnos (a igualdad, por ciudad).

**Resultado esperado:**

| ciudad | alumnos |
|---|---|
| Cádiz | 5 |
| Sevilla | 4 |
| Jerez | 3 |
| Málaga | 2 |

*4 filas*

<details class="sol" data-key="sql/u05/S5.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT ciudad, COUNT(*) AS alumnos FROM alumnos GROUP BY ciudad ORDER BY alumnos DESC, ciudad;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.4

**Media por asignatura.** Nombre de cada asignatura y su **nota media** (2 decimales) en la convocatoria 1, de la media más alta a la más baja.

**Resultado esperado:**

| asignatura | media |
|---|---|
| Entornos de Desarrollo | 7.13 |
| Sistemas Informáticos | 7.13 |
| Programación | 6.67 |
| Lenguajes de Marcas | 6.63 |
| Bases de Datos | 5.81 |
| Inglés Técnico | 5.63 |

*6 filas*

<details class="sol" data-key="sql/u05/S5.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, ROUND(AVG(n.nota), 2) AS media
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
GROUP BY s.id, s.nombre
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.5

**Ciudades grandes.** Las ciudades que tienen **al menos 3 alumnos**, con su número de alumnos.

**Resultado esperado:**

| ciudad | alumnos |
|---|---|
| Cádiz | 5 |
| Sevilla | 4 |
| Jerez | 3 |

*3 filas*

<details class="sol" data-key="sql/u05/S5.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT ciudad, COUNT(*) AS alumnos FROM alumnos GROUP BY ciudad HAVING COUNT(*) &gt;= 3 ORDER BY alumnos DESC, ciudad;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.6

**Alumnos por grupo.** El nombre de cada grupo y cuántos alumnos tiene, ordenado por nombre de grupo.

**Resultado esperado:**

| grupo | alumnos |
|---|---|
| 1DAM-A | 4 |
| 1DAM-B | 5 |
| 2DAM-A | 4 |

*3 filas*

<details class="sol" data-key="sql/u05/S5.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT g.nombre AS grupo, COUNT(*) AS alumnos
FROM alumnos a
JOIN grupos g ON g.id = a.id_grupo
GROUP BY g.id, g.nombre
ORDER BY g.nombre;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.7

**Los mejores expedientes.** Nombre, apellido y **nota media** (2 decimales) de los alumnos, usando solo la convocatoria 1, mostrando únicamente los que tienen una media **de 7 o más**. Ordena de mayor a menor media.

**Resultado esperado:**

| nombre | apellido | media |
|---|---|---|
| Iván | Torres | 8.5 |
| Marta | Díaz | 7.75 |
| Raúl | Campos | 7.67 |
| Lola | Ortiz | 7.5 |
| Sara | Vega | 7.13 |
| Luis | Romero | 7.0 |

*6 filas*

<details class="sol" data-key="sql/u05/S5.7">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido, ROUND(AVG(n.nota), 2) AS media
FROM alumnos a
JOIN notas n ON n.id_alumno = a.id
WHERE n.convocatoria = 1
GROUP BY a.id, a.nombre, a.apellido
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.8

**Asignaturas con muchos suspensos.** Nombre de cada asignatura y su **número de suspensos** (nota menor de 5) en la convocatoria 1, mostrando solo las que tienen **al menos 2**.

**Resultado esperado:**

| asignatura | suspensos |
|---|---|
| Bases de Datos | 5 |
| Lenguajes de Marcas | 2 |
| Programación | 2 |

*3 filas*

<details class="sol" data-key="sql/u05/S5.8">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, COUNT(*) AS suspensos
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1 AND n.nota &lt; 5
GROUP BY s.id, s.nombre
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.9

**Por encima de la media.** `id_alumno`, `id_asignatura` y nota de las notas de la convocatoria 1 **mayores que la media** de esa misma convocatoria. Usa una subconsulta. Ordena de mayor a menor nota.

**Resultado esperado:**

| id_alumno | id_asignatura | nota |
|---|---|---|
| 6 | 3 | 10.0 |
| 5 | 4 | 9.5 |
| 6 | 1 | 9.5 |
| 12 | 5 | 9.5 |
| 1 | 3 | 9.0 |
| 8 | 2 | 9.0 |
| … | … | … |

*26 filas* (se muestran 6)

<details class="sol" data-key="sql/u05/S5.9">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT id_alumno, id_asignatura, nota
FROM notas
WHERE convocatoria = 1
  AND nota &gt; (SELECT AVG(nota) FROM notas WHERE convocatoria = 1)
ORDER BY nota DESC, id_alumno;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.10

**Con algún suspenso.** Nombre y apellido de los alumnos que han sacado **alguna nota menor de 5** en cualquier convocatoria. Usa `IN` con una subconsulta. Ordena por apellido.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Ana | Gil |
| Elena | Marín |
| Pablo | Núñez |
| Marcos | Peña |
| Noa | Prieto |
| Álex | Roca |
| … | … |

*8 filas* (se muestran 6)

<details class="sol" data-key="sql/u05/S5.10">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido
FROM alumnos
WHERE id IN (SELECT id_alumno FROM notas WHERE nota &lt; 5)
ORDER BY apellido;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.11

**Sin suspensos.** Nombre y apellido de los alumnos que **tienen notas** en la convocatoria 1 pero **ninguna menor de 5**. Usa `EXISTS` y `NOT EXISTS`. Ordena por apellido.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Raúl | Campos |
| Marta | Díaz |
| Lola | Ortiz |
| Luis | Romero |
| Iván | Torres |

*5 filas*

<details class="sol" data-key="sql/u05/S5.11">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT a.nombre, a.apellido
FROM alumnos a
WHERE EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id AND n.convocatoria = 1)
  AND NOT EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id AND n.convocatoria = 1 AND n.nota &lt; 5)
ORDER BY a.apellido;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S5.12

⭐ **Reto: la mejor nota de cada asignatura.** Para cada asignatura (nombre), el **nombre del alumno** que sacó la **nota más alta** en la convocatoria 1 y esa nota. (Si hay empate, saldrán todos los empatados.) Pista: una subconsulta correlacionada con `MAX`.

**Resultado esperado:**

| asignatura | nombre | nota |
|---|---|---|
| Bases de Datos | Raúl | 9.0 |
| Entornos de Desarrollo | Iván | 10.0 |
| Inglés Técnico | Raúl | 6.5 |
| Lenguajes de Marcas | Sara | 9.5 |
| Programación | Iván | 9.5 |
| Sistemas Informáticos | Marcos | 9.5 |

*6 filas*

<details class="sol" data-key="sql/u05/S5.12">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT s.nombre AS asignatura, a.nombre, n.nota
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
