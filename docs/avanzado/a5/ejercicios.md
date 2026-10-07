# SA5 · Ejercicios de SQL moderno

<div class="ej-gate" data-unit="a5" data-nombre="A5 · SQL moderno"></div>

Los ejercicios SA5.1, SA5.2 y SA5.5 usan las tablas de las páginas [A5.1](01-upsert.md) y [A5.2](02-json.md): en cada ejercicio la base de datos **parte de cero**, así que incluye tú las sentencias de creación. Los SA5.3 y SA5.4 usan la base de datos del instituto. Escribe tú toda la solución.

## Ejercicio SA5.1

**Un contador de visitas.** Con esta tabla:

```sql
CREATE TABLE visitas (
  pagina TEXT    PRIMARY KEY,
  total  INTEGER NOT NULL
);
```

Registra **tres visitas** a la página `inicio` con tres sentencias iguales (`INSERT` con `ON CONFLICT`) y muestra `pagina` y `total`. El total debe ser `3`.

**Resultado esperado:**

| pagina | total |
|---|---|
| inicio | 3 |

*1 fila*

<details class="sol" data-key="sql/a5/SA5.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE visitas (
  pagina TEXT    PRIMARY KEY,
  total  INTEGER NOT NULL
);
INSERT INTO visitas VALUES ('inicio', 1) ON CONFLICT(pagina) DO UPDATE SET total = total + 1;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA5.2

**Recibir mercancía.** Con la tabla `stock` de la página A5.1 (con sus dos filas iniciales, café `10` y té `4`):

```sql
CREATE TABLE stock (
  producto TEXT    PRIMARY KEY,
  cantidad INTEGER NOT NULL,
  nota     TEXT
);
INSERT INTO stock VALUES ('café', 10, 'pedir más'), ('té', 4, NULL);
```

En **una sola sentencia** llegan `5` de café, `6` de té y `2` de zumo: lo que ya existe **suma** la cantidad y lo que no existe se **crea**. Muestra `producto` y `cantidad`, ordenados por producto. La `nota` del café debe conservarse.

**Resultado esperado:**

| producto | cantidad |
|---|---|
| café | 15 |
| té | 10 |
| zumo | 2 |

*3 filas*

<details class="sol" data-key="sql/a5/SA5.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE stock (
  producto TEXT    PRIMARY KEY,
  cantidad INTEGER NOT NULL,
  nota     TEXT
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA5.3

**Subir las horas y verlas.** Con la base de datos del instituto: suma `10` horas a las asignaturas del **profesor 3** y, **en la misma sentencia**, muestra con `RETURNING` el `nombre` y las `horas` de cada asignatura **ya modificada**.

**Resultado esperado:**

| nombre | horas |
|---|---|
| Entornos de Desarrollo | 110 |
| Lenguajes de Marcas | 110 |

*2 filas*

<details class="sol" data-key="sql/a5/SA5.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>UPDATE asignaturas
SET horas = horas + 10
WHERE id_profesor = 3
RETURNING nombre, horas;
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA5.4

**El cuadro de honor.** Con la base de datos del instituto: crea una tabla `cuadro_honor` con las columnas `id_alumno` (clave primaria) y `media`, y rellénala con **una sola sentencia `INSERT ... SELECT`** con los alumnos cuya **media de la convocatoria 1 sea de 7,5 o más** (la media, redondeada a 2 decimales). Muestra `id_alumno` y `media`, ordenados por media de mayor a menor y, si empatan, por `id_alumno`.

**Resultado esperado:**

| id_alumno | media |
|---|---|
| 6 | 8.5 |
| 3 | 7.75 |
| 8 | 7.67 |
| 11 | 7.5 |

*4 filas*

<details class="sol" data-key="sql/a5/SA5.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE cuadro_honor (
  id_alumno INTEGER PRIMARY KEY,
  media     REAL NOT NULL
);
INSERT INTO cuadro_honor (id_alumno, media)
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA5.5

**Consultar un JSON.** Con la tabla `productos` de la página A5.2:

```sql
CREATE TABLE productos (
  id        INTEGER PRIMARY KEY,
  nombre    TEXT NOT NULL,
  atributos TEXT CHECK (json_valid(atributos))   -- JSON guardado como texto
);
INSERT INTO productos VALUES
  (1, 'Camiseta', '{"color":"rojo","tallas":["S","M","L"],"peso_g":180}'),
  (2, 'Sudadera', '{"color":"azul","tallas":["M","L"],"peso_g":450}'),
  (3, 'Gorra',    '{"color":"rojo","tallas":["U"],"extra":{"logo":true}}');
```

Muestra el `nombre` y el `peso` en gramos (`peso_g`) de los productos de color **rojo** que **tengan peso** indicado, ordenados por nombre. Usa `->>` tanto para filtrar por el color como para sacar el peso.

**Resultado esperado:**

| nombre | peso |
|---|---|
| Camiseta | 180 |

*1 fila*

<details class="sol" data-key="sql/a5/SA5.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE productos (
  id        INTEGER PRIMARY KEY,
  nombre    TEXT NOT NULL,
  atributos TEXT CHECK (json_valid(atributos))   -- JSON guardado como texto
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA5.6

**Una columna generada.** Crea una tabla `articulos` con `id` (clave primaria), `precio` (entero, en céntimos), `iva` (entero, el porcentaje) y una columna **generada y guardada** (`STORED`) llamada `precio_final` que sea `precio + precio * iva / 100` (con división entera). Inserta `(1, 1000, 21)`, `(2, 250, 10)` y `(3, 800, 4)` **solo con `precio` e `iva`** y muestra todas las columnas ordenadas por `id`.

**Resultado esperado:**

| id | precio | iva | precio_final |
|---|---|---|---|
| 1 | 1000 | 21 | 1210 |
| 2 | 250 | 10 | 275 |
| 3 | 800 | 4 | 832 |

*3 filas*

<details class="sol" data-key="sql/a5/SA5.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE articulos (
  id           INTEGER PRIMARY KEY,
  precio       INTEGER NOT NULL,
  iva          INTEGER NOT NULL,
  precio_final INTEGER GENERATED ALWAYS AS (precio + precio * iva / 100) STORED
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
