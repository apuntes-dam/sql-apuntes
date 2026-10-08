# S7 · Ejercicios de bases de datos no relacionales

<div class="ej-gate" data-unit="u07" data-nombre="U7 · Bases de datos no relacionales"></div>

Todos usan **SQLite con documentos JSON** (no hay un MongoDB real). Para cada ejercicio, **crea primero las tablas** con el script que se da (hay dos: la versión **documental** `pedidos_doc` y la **relacional** `clientes`/`pedidos`/`lineas`) y escribe tu solución a continuación. Los operadores útiles: `doc ->> '$.campo.anidado'` lee un campo, `json_each(doc, '$.lista')` recorre una lista, `json_set`, `json_object` y `json_group_array`.

## Ejercicio S7.1

**Leer campos de un documento.** Con la tabla documental `pedidos_doc`, muestra `id`, el `cliente` (su nombre) y su `ciudad`, ordenados por `id`.

Para crearla:

```sql
CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
```

**Resultado esperado:**

| id | cliente | ciudad |
|---|---|---|
| 101 | Ana | Lugo |
| 102 | Ana | Lugo |
| 103 | Luis | Vigo |

*3 filas*

<details class="sol" data-key="sql/u07/S7.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S7.2

**Buscar dentro de una lista.** ¿Qué pedidos incluyen **Cuaderno** entre sus líneas? Muestra solo los `id`, **sin repetir**, ordenados.

Usa la misma tabla `pedidos_doc` del ejercicio anterior (créala con su script).

**Resultado esperado:**

| id |
|---|
| 101 |
| 103 |

*2 filas*

<details class="sol" data-key="sql/u07/S7.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S7.3

**Agrupar documentos.** Con `pedidos_doc`: el `cliente` y el **total gastado** (precio × cantidad de todas sus líneas, sumando todos sus pedidos), redondeado a 2 decimales, del que más gasta al que menos.

Usa la misma tabla `pedidos_doc` (con su script).

**Resultado esperado:**

| cliente | total_gastado |
|---|---|
| Ana | 41.0 |
| Luis | 5.3 |

*2 filas*

<details class="sol" data-key="sql/u07/S7.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S7.4

**De tablas a documentos.** Con las tablas **relacionales**, genera **un documento JSON por pedido** con esta forma: `{"id": 101, "cliente": "Ana", "lineas": [{"producto": ..., "cantidad": ...}, ...]}`, con las líneas **ordenadas por producto** y los pedidos por `id`. Una sola columna llamada `documento`.

Para crear las tablas:

```sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciudad TEXT NOT NULL);
CREATE TABLE pedidos  (id INTEGER PRIMARY KEY, id_cliente INTEGER NOT NULL REFERENCES clientes(id), fecha TEXT NOT NULL);
CREATE TABLE lineas   (id_pedido INTEGER NOT NULL REFERENCES pedidos(id), producto TEXT NOT NULL, precio REAL NOT NULL, cantidad INTEGER NOT NULL);
INSERT INTO clientes VALUES (1, 'Ana', 'Lugo'), (2, 'Luis', 'Vigo');
INSERT INTO pedidos VALUES (101, 1, '2025-03-01'), (102, 1, '2025-03-05'), (103, 2, '2025-03-07');
INSERT INTO lineas VALUES (101, 'Cuaderno', 3.5, 2), (101, 'Lápiz', 0.9, 10), (102, 'Mochila', 25, 1), (103, 'Cuaderno', 3.5, 1), (103, 'Goma', 0.6, 3);
```

**Resultado esperado:**

| documento |
|---|
| {"id":101,"cliente":"Ana","lineas":[{"producto":"Cuaderno","cantidad":2},{"producto":"Lápiz","cantidad":10}]} |
| {"id":102,"cliente":"Ana","lineas":[{"producto":"Mochila","cantidad":1}]} |
| {"id":103,"cliente":"Luis","lineas":[{"producto":"Cuaderno","cantidad":1},{"producto":"Goma","cantidad":3}]} |

*3 filas*

<details class="sol" data-key="sql/u07/S7.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciudad TEXT NOT NULL);
CREATE TABLE pedidos  (id INTEGER PRIMARY KEY, id_cliente INTEGER NOT NULL REFERENCES clientes(id), fecha TEXT NOT NULL);
CREATE TABLE lineas   (id_pedido INTEGER NOT NULL REFERENCES pedidos(id), producto TEXT NOT NULL, precio REAL NOT NULL, cantidad INTEGER NOT NULL);
INSERT INTO clientes VALUES (1, 'Ana', 'Lugo'), (2, 'Luis', 'Vigo');
INSERT INTO pedidos VALUES (101, 1, '2025-03-01'), (102, 1, '2025-03-05'), (103, 2, '2025-03-07');
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S7.5

**Modificar dentro de un documento.** En `pedidos_doc`, añade el campo `prioridad` con el valor `alta` a los pedidos que tengan la etiqueta `urgente`, y después muestra `id` y `prioridad` de todos los pedidos (los que no la tienen deben mostrar `NULL`).

Usa la misma tabla `pedidos_doc` (con su script).

**Resultado esperado:**

| id | prioridad |
|---|---|
| 101 | alta |
| 102 | NULL |
| 103 | alta |

*3 filas*

<details class="sol" data-key="sql/u07/S7.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio S7.6

⭐ **Recorrer una red.** Con la tabla `amistades` (las amistades valen **en los dos sentidos**), muestra **quién está a uno o dos saltos de Luis**, con su número de `saltos` (el **mínimo**), ordenado por saltos y nombre. Luis no debe aparecer. Necesitas una consulta **recursiva**.

Para crear la tabla:

```sql
CREATE TABLE amistades (a TEXT NOT NULL, b TEXT NOT NULL);
INSERT INTO amistades VALUES ('Ana', 'Luis'), ('Ana', 'Marta'), ('Luis', 'Pablo'), ('Marta', 'Sara'), ('Pablo', 'Sara'), ('Sara', 'Eva');
```

**Resultado esperado:**

| nombre | saltos |
|---|---|
| Ana | 1 |
| Pablo | 1 |
| Marta | 2 |
| Sara | 2 |

*4 filas*

<details class="sol" data-key="sql/u07/S7.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE amistades (a TEXT NOT NULL, b TEXT NOT NULL);
INSERT INTO amistades VALUES ('Ana', 'Luis'), ('Ana', 'Marta'), ('Luis', 'Pablo'), ('Marta', 'Sara'), ('Pablo', 'Sara'), ('Sara', 'Eva');
WITH RECURSIVE vecinos(x, y) AS (SELECT a, b FROM amistades UNION SELECT b, a FROM amistades),
alcance(nombre, saltos) AS (
  SELECT 'Luis', 0
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
