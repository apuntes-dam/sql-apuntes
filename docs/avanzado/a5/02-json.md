# A5.2 JSON y columnas generadas

## JSON dentro de una columna

Una tabla relacional tiene **las mismas columnas en todas las filas**. Pero hay datos cuya forma **varía**: los atributos de un producto (una camiseta tiene tallas; una gorra, un logo; un libro, un autor). Una solución es guardar esos atributos como **JSON** en una columna de texto. Para reproducir los ejemplos, ejecuta antes:

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

El `CHECK (json_valid(atributos))` hace que **solo se acepte JSON bien formado**: un texto roto se rechaza al insertarlo.

## Extraer valores: `->` y `->>`

Dos operadores sacan datos de un JSON, indicando **la ruta** con la sintaxis `'$.campo'`:

* **`->>`** devuelve el valor **como un valor SQL** normal (texto, número...). Es el que sueles querer.
* **`->`** devuelve el valor **como JSON** (con sus comillas, corchetes...).

```sql
SELECT nombre,
       atributos ->> '$.color'            AS color,
       atributos -> '$.tallas'            AS tallas_json,
       atributos ->> '$.tallas[0]'        AS primera_talla,
       json_array_length(atributos, '$.tallas') AS n_tallas
FROM productos;
```

Resultado:

| nombre | color | tallas_json | primera_talla | n_tallas |
|---|---|---|---|---|
| Camiseta | rojo | ["S","M","L"] | S | 3 |
| Sudadera | azul | ["M","L"] | M | 2 |
| Gorra | rojo | ["U"] | U | 1 |

*3 filas*

Se pueden recorrer rutas anidadas (`'$.extra.logo'`) y posiciones de una lista (`'$.tallas[0]'`). Si **el campo no existe**, el resultado es `NULL`, sin error: la gorra no tiene `peso_g`, y no pasa nada:

```sql
SELECT nombre,
       atributos ->> '$.peso_g'        AS peso,
       atributos ->> '$.extra.logo'    AS logo
FROM productos;
```

Resultado:

| nombre | peso | logo |
|---|---|---|
| Camiseta | 180 | NULL |
| Sudadera | 450 | NULL |
| Gorra | NULL | 1 |

*3 filas*

En SQLite hay también la función `json_extract(atributos, '$.color')`, equivalente a `->>`. **PostgreSQL** (con el tipo `jsonb`) y **MySQL** (con el tipo `JSON`) tienen los mismos operadores `->` y `->>`, con alguna diferencia de sintaxis en las rutas.

## Filtrar y agrupar por un valor del JSON

Un valor extraído se usa **como cualquier columna**:

```sql
SELECT atributos ->> '$.color' AS color, COUNT(*) AS productos
FROM productos
GROUP BY color
ORDER BY color;
```

Resultado:

| color | productos |
|---|---|
| azul | 1 |
| rojo | 2 |

*2 filas*

## Una fila por cada elemento de una lista

`json_each` **desdobla una lista JSON en filas**, una por elemento (en la columna `value`). Así se obtiene una fila por cada **talla** de cada producto, lo que sería una tabla aparte en un diseño relacional:

```sql
SELECT p.nombre, t.value AS talla
FROM productos p, json_each(p.atributos, '$.tallas') t
ORDER BY p.id, t.key;
```

Resultado:

| nombre | talla |
|---|---|
| Camiseta | S |
| Camiseta | M |
| Camiseta | L |
| Sudadera | M |
| Sudadera | L |
| Gorra | U |

*6 filas*

## Modificar y construir JSON

`json_set(json, ruta, valor)` **cambia o añade** un campo y devuelve el JSON nuevo, sin tocar el resto. Junto con `RETURNING` (de la [página anterior](01-upsert.md)) se ve el resultado al instante:

```sql
UPDATE productos
SET atributos = json_set(atributos, '$.color', 'verde')
WHERE id = 1
RETURNING nombre, atributos;
```

Resultado:

| nombre | atributos |
|---|---|
| Camiseta | {"color":"verde","tallas":["S","M","L"],"peso_g":180} |

*1 fila*

Y al revés, `json_object` y `json_group_array` **construyen JSON desde filas**, útil para devolver a una aplicación web un resultado ya en el formato que espera:

```sql
SELECT json_group_array(
         json_object('producto', nombre, 'color', atributos ->> '$.color')
       ) AS respuesta
FROM productos;
```

Resultado:

| respuesta |
|---|
| [{"producto":"Camiseta","color":"rojo"},{"producto":"Sudadera","color":"azul"},{"producto":"Gorra","color":"rojo"}] |

*1 fila*

## ¿JSON o columnas?

| Usa **columnas** cuando | Usa **JSON** cuando |
|---|---|
| Los datos tienen **la misma forma** en todas las filas | Los datos **varían** de una fila a otra |
| Vas a **filtrar, ordenar o unir** por ellos a menudo | Se leen **juntos**, como un bloque |
| Necesitas **restricciones** (`NOT NULL`, claves foráneas) | La estructura **cambia** con frecuencia |
| Quieres que la base de datos **entienda** el dato (tipos, integridad) | Guardas lo que **te envía otro sistema** tal cual |

Un JSON **no sustituye** al diseño de tablas: es una **válvula de escape** para lo que de verdad es flexible. Si en todas las filas hay un campo `color`, **debería ser una columna**.

## Columnas generadas

Una **columna generada** es una columna cuyo valor **calcula la propia base de datos** a partir de otras de la misma fila; no se puede escribir a mano. Con `GENERATED ALWAYS AS (expresión)`:

* **`VIRTUAL`** (por defecto): **no se guarda**; se calcula cada vez que se lee. No ocupa espacio.
* **`STORED`**: **se guarda** al escribir la fila. Ocupa espacio, pero se lee sin calcular.

```sql
CREATE TABLE rectangulos (
  id        INTEGER PRIMARY KEY,
  ancho     INTEGER NOT NULL,
  alto      INTEGER NOT NULL,
  area      INTEGER GENERATED ALWAYS AS (ancho * alto)       VIRTUAL,
  perimetro INTEGER GENERATED ALWAYS AS (2 * (ancho + alto)) STORED
);
INSERT INTO rectangulos (ancho, alto) VALUES (3, 4), (5, 2), (1, 9);

SELECT * FROM rectangulos ORDER BY area;
```

Resultado:

| id | ancho | alto | area | perimetro |
|---|---|---|---|---|
| 3 | 1 | 9 | 9 | 20 |
| 2 | 5 | 2 | 10 | 14 |
| 1 | 3 | 4 | 12 | 14 |

*3 filas*

`area` y `perimetro` **siempre están al día**: si cambias el ancho de una fila, **se recalculan solos**, sin que la aplicación tenga que acordarse. Y si intentas escribir en una, SQLite lo rechaza (`cannot INSERT into generated column`). La diferencia con una **vista** es que la columna generada vive **dentro de la tabla**.

### Un índice sobre un valor calculado

Una columna generada, o una **expresión**, se puede **indexar**. Así se hace rápida la búsqueda por un campo que está **dentro de un JSON**:

```sql
CREATE INDEX idx_color ON productos (atributos ->> '$.color');

EXPLAIN QUERY PLAN
SELECT * FROM productos WHERE atributos ->> '$.color' = 'rojo';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 61 | SEARCH productos USING INDEX idx_color (<expr>=?) |

*1 fila*

El plan dice `SEARCH ... USING INDEX idx_color`: busca en el índice, **sin recorrer los productos**. Para que sirva, la consulta debe usar **exactamente la misma expresión** que el índice (como viste en la [A3.2](../a3/02-indices.md): lo que se transforma en el `WHERE` tiene que coincidir con lo indexado).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Guardar en JSON datos que **todas** las filas tienen | Haz de ellos una **columna** |
| Olvidar `json_valid` y guardar JSON roto | `CHECK (json_valid(columna))` |
| Confundir `->` con `->>` | `->>` da un valor SQL; `->` da JSON (con comillas) |
| Esperar un error si el campo no existe | Da `NULL`: compruébalo si importa |
| Intentar escribir en una columna generada | Se calcula sola: escribe en las columnas de las que depende |
| Filtrar por un campo del JSON sin índice en una tabla grande | Un índice sobre la **misma expresión** |

## Para practicar

Los ejercicios SA5.5 y SA5.6 de [SA5 · Ejercicios](ejercicios.md) practican las consultas sobre JSON y las columnas generadas.
