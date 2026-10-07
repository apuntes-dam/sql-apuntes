# S2 · Ejercicios de diseño

<div class="ej-gate" data-unit="u02" data-nombre="U2 · Diseño de bases de datos"></div>

Cada ejercicio parte de un enunciado y pide **escribir las tablas** (`CREATE TABLE`) con sus claves. Se parte de una **base de datos vacía**. Al final de la solución hay un `SELECT` que lista las tablas creadas, para que compruebes que tienes las mismas.

## Ejercicio S2.1

**Biblioteca.** Una biblioteca tiene **socios** (nombre y correo, que no se repite) y **libros** (título y autor). Un socio puede tomar prestados muchos libros y un libro lo toman muchos socios, **en distintas fechas**. De cada préstamo interesa la fecha de préstamo y la de devolución (que está vacía hasta que se devuelve). Escribe las tablas.

**Resultado esperado:**

| tabla |
|---|
| libros |
| prestamos |
| socios |

*3 filas*

<details class="sol" data-key="sql/u02/S2.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE socios (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S2.2

**Equipos.** Un **equipo** (nombre y ciudad) tiene muchos **jugadores** (nombre, dorsal y fecha de nacimiento). Cada jugador pertenece a **un único equipo**, y dentro de un equipo no puede haber dos jugadores con el mismo dorsal. Escribe las tablas.

**Resultado esperado:**

| tabla |
|---|
| equipos |
| jugadores |

*2 filas*

<details class="sol" data-key="sql/u02/S2.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE equipos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S2.3

**Aparcamiento.** Una empresa tiene **empleados** (nombre y departamento) y **plazas de aparcamiento** (número de plaza). Cada empleado puede tener, como mucho, **una** plaza, y cada plaza se asigna, como mucho, a **un** empleado. Escribe las tablas (relación 1:1).

**Resultado esperado:**

| tabla |
|---|
| empleados |
| plazas |

*2 filas*

<details class="sol" data-key="sql/u02/S2.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE empleados (
  id           INTEGER PRIMARY KEY,
  nombre       TEXT NOT NULL,
  departamento TEXT NOT NULL
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S2.4

**Cursos.** Una academia tiene **estudiantes** (nombre y correo) y **cursos** (nombre y precio). Un estudiante se **matricula** en muchos cursos y un curso tiene muchos estudiantes. De cada matrícula se guarda la **fecha** y la **nota final** (que no existe hasta que acaba el curso). Escribe las tablas.

**Resultado esperado:**

| tabla |
|---|
| cursos |
| estudiantes |
| matriculas |

*3 filas*

<details class="sol" data-key="sql/u02/S2.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE estudiantes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S2.5

**Normalizar.** Esta tabla guarda las reservas de un hotel y tiene problemas de diseño:

`reservas(id_reserva, huesped, telefono_huesped, habitacion, tipo_habitacion, precio_noche, noches)`

El huésped puede reservar muchas veces, y el **tipo** y el **precio por noche** dependen de la habitación. Explica en un comentario qué anomalías tiene y escribe las tablas **en 3FN**.

**Resultado esperado:**

| tabla |
|---|
| habitaciones |
| huespedes |
| reservas |

*3 filas*

<details class="sol" data-key="sql/u02/S2.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>-- Anomalías: el teléfono del huésped se repite en cada reserva (actualización),
-- no se puede registrar una habitación sin reservas (inserción) y el tipo y el precio
-- dependen de la habitación, no de la reserva (dependencia transitiva).
CREATE TABLE huespedes (
  id       INTEGER PRIMARY KEY,
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S2.6

⭐ **Reto: cine.** Una red de cines tiene **salas** (número y aforo) y **películas** (título y duración). Una **sesión** es la proyección de una película en una sala a una fecha y hora concretas. Los **espectadores** compran **entradas** para una sesión, ocupando una **butaca** (fila y número); en una misma sesión, una butaca solo se puede vender una vez. Diseña y escribe las tablas.

**Resultado esperado:**

| tabla |
|---|
| entradas |
| espectadores |
| peliculas |
| salas |
| sesiones |

*5 filas*

<details class="sol" data-key="sql/u02/S2.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE salas (
  id     INTEGER PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  aforo  INTEGER NOT NULL
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
