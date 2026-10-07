# S1 · Ejercicios de primeros pasos

<div class="ej-gate" data-unit="u01" data-nombre="U1 · Primeros pasos"></div>

Todos usan la base de datos del instituto ([descripción](01-bases-de-datos.md)). Escribe cada consulta, ejecútala y **compara con el resultado esperado** que aparece bajo cada enunciado antes de mirar la solución.

## Ejercicio S1.1

**Todas las asignaturas.** Muestra todas las columnas de la tabla `asignaturas`.

**Resultado esperado:**

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 1 | Programación | 230 | 1 |
| 2 | Bases de Datos | 160 | 2 |
| 3 | Entornos de Desarrollo | 100 | 3 |
| 4 | Lenguajes de Marcas | 100 | 3 |
| 5 | Sistemas Informáticos | 160 | 4 |
| 6 | Inglés Técnico | 60 | NULL |

*6 filas*

<details class="sol" data-key="sql/u01/S1.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT * FROM asignaturas;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.2

**Nombre y ciudad.** Muestra solo el nombre y la ciudad de todos los alumnos.

**Resultado esperado:**

| nombre | ciudad |
|---|---|
| Ana | Cádiz |
| Luis | Sevilla |
| Marta | Cádiz |
| Pablo | Jerez |
| Sara | Sevilla |
| Iván | Cádiz |
| … | … |

*14 filas* (se muestran 6)

<details class="sol" data-key="sql/u01/S1.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, ciudad FROM alumnos;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.3

**Ciudades distintas.** Muestra cada ciudad una sola vez, ordenadas alfabéticamente.

**Resultado esperado:**

| ciudad |
|---|
| Cádiz |
| Jerez |
| Málaga |
| Sevilla |

*4 filas*

<details class="sol" data-key="sql/u01/S1.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT DISTINCT ciudad FROM alumnos ORDER BY ciudad;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.4

**De Sevilla.** Nombre y apellido de los alumnos que viven en Sevilla.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Luis | Romero |
| Sara | Vega |
| Dani | Soto |
| Álex | Roca |

*4 filas*

<details class="sol" data-key="sql/u01/S1.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido FROM alumnos WHERE ciudad = 'Sevilla';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.5

**Nacidos en 2005.** Nombre, apellido y fecha de nacimiento de los alumnos nacidos durante 2005.

**Resultado esperado:**

| nombre | apellido | nacimiento |
|---|---|---|
| Ana | Gil | 2005-03-14 |
| Marta | Díaz | 2005-07-21 |
| Sara | Vega | 2005-09-09 |
| Dani | Soto | 2005-04-01 |
| Irene | Lara | 2005-12-24 |

*5 filas*

<details class="sol" data-key="sql/u01/S1.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido, nacimiento FROM alumnos WHERE nacimiento BETWEEN '2005-01-01' AND '2005-12-31';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.6

**Apellidos por R o T.** Nombre y apellido de los alumnos cuyo apellido empieza por R o por T.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Luis | Romero |
| Iván | Torres |
| Álex | Roca |

*3 filas*

<details class="sol" data-key="sql/u01/S1.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido FROM alumnos WHERE apellido LIKE 'R%' OR apellido LIKE 'T%';
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.7

**Sin grupo.** Los alumnos que todavía no están asignados a ningún grupo.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Irene | Lara |

*1 fila*

<details class="sol" data-key="sql/u01/S1.7">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido FROM alumnos WHERE id_grupo IS NULL;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.8

**Asignaturas largas.** Nombre y horas de las asignaturas de **más de 100 horas**, de la que más horas tiene a la que menos (a igualdad de horas, por nombre).

**Resultado esperado:**

| nombre | horas |
|---|---|
| Programación | 230 |
| Bases de Datos | 160 |
| Sistemas Informáticos | 160 |

*3 filas*

<details class="sol" data-key="sql/u01/S1.8">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, horas FROM asignaturas WHERE horas &gt; 100 ORDER BY horas DESC, nombre;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.9

**Sin profesor.** Las asignaturas que todavía no tienen profesor asignado.

**Resultado esperado:**

| nombre |
|---|
| Inglés Técnico |

*1 fila*

<details class="sol" data-key="sql/u01/S1.9">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre FROM asignaturas WHERE id_profesor IS NULL;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.10

**Los más jóvenes.** Nombre, apellido y fecha de nacimiento de los **tres** alumnos más jóvenes.

**Resultado esperado:**

| nombre | apellido | nacimiento |
|---|---|---|
| Irene | Lara | 2005-12-24 |
| Sara | Vega | 2005-09-09 |
| Marta | Díaz | 2005-07-21 |

*3 filas*

<details class="sol" data-key="sql/u01/S1.10">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido, nacimiento FROM alumnos ORDER BY nacimiento DESC LIMIT 3;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.11

**Nombre completo.** Una sola columna llamada `nombre_completo` (nombre, un espacio y apellido) de los alumnos de **Cádiz o Jerez**, ordenados por apellido. Usa `IN`.

**Resultado esperado:**

| nombre_completo |
|---|
| Raúl Campos |
| Marta Díaz |
| Ana Gil |
| Irene Lara |
| Pablo Núñez |
| Marcos Peña |
| … |

*8 filas* (se muestran 6)

<details class="sol" data-key="sql/u01/S1.11">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre || ' ' || apellido AS nombre_completo FROM alumnos WHERE ciudad IN ('Cádiz', 'Jerez') ORDER BY apellido;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.12

**Aprobados en segunda.** Alumno (`id_alumno`) y nota de quienes **aprobaron** (`nota >= 5`) la asignatura 1 en la **convocatoria 2**.

**Resultado esperado:**

| id_alumno | nota |
|---|---|
| 1 | 5.5 |
| 4 | 7.0 |

*2 filas*

<details class="sol" data-key="sql/u01/S1.12">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT id_alumno, nota FROM notas WHERE id_asignatura = 1 AND convocatoria = 2 AND nota &gt;= 5;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.13

**Primero y nombre corto.** Nombre y apellido de los alumnos de **primer curso** (grupos 1 y 2) cuyo nombre tiene **exactamente 4 letras**.

**Resultado esperado:**

| nombre | apellido |
|---|---|
| Luis | Romero |
| Sara | Vega |
| Iván | Torres |
| Dani | Soto |
| Lola | Ortiz |
| Álex | Roca |

*6 filas*

<details class="sol" data-key="sql/u01/S1.13">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido FROM alumnos WHERE id_grupo IN (1, 2) AND LENGTH(nombre) = 4;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S1.14

⭐ **Reto: nacidos en verano.** Nombre, apellido y mes de nacimiento de los alumnos nacidos en **junio, julio o agosto**, ordenados por mes. (Pista: `strftime('%m', nacimiento)` da el mes como texto de dos cifras.)

**Resultado esperado:**

| nombre | apellido | mes |
|---|---|---|
| Raúl | Campos | 06 |
| Marta | Díaz | 07 |
| Lola | Ortiz | 08 |

*3 filas*

<details class="sol" data-key="sql/u01/S1.14">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>SELECT nombre, apellido, strftime('%m', nacimiento) AS mes FROM alumnos WHERE strftime('%m', nacimiento) IN ('06', '07', '08') ORDER BY mes;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
