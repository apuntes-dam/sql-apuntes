# 7.1 Relacional frente a no relacional

!!! info "Qué se ha ejecutado y qué no"
    En esta unidad **no hay un servidor de MongoDB, Redis, Cassandra ni Neo4j**. Lo que ves con resultado se ha **ejecutado de verdad en SQLite**, que sabe **guardar y consultar documentos JSON**: sirve para ver el *modelo* de datos y sus consecuencias, aunque no es una base de datos documental completa. Los modelos en Python están marcados como **didácticos** (explican la idea, no son un motor real). Las órdenes de los motores de verdad se muestran como «**sin ejecutar**»: necesitan instalar su servidor.

## Dos formas de organizar los mismos datos

Un **pedido** de una tienda tiene un cliente, una fecha y varias líneas (producto, precio, cantidad). Así lo guardaría una base **relacional**, repartido en **tres tablas** unidas por claves:

```sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciudad TEXT NOT NULL);
CREATE TABLE pedidos  (id INTEGER PRIMARY KEY, id_cliente INTEGER NOT NULL REFERENCES clientes(id), fecha TEXT NOT NULL);
CREATE TABLE lineas   (id_pedido INTEGER NOT NULL REFERENCES pedidos(id), producto TEXT NOT NULL, precio REAL NOT NULL, cantidad INTEGER NOT NULL);
INSERT INTO clientes VALUES (1, 'Ana', 'Lugo'), (2, 'Luis', 'Vigo');
INSERT INTO pedidos VALUES (101, 1, '2025-03-01'), (102, 1, '2025-03-05'), (103, 2, '2025-03-07');
INSERT INTO lineas VALUES (101, 'Cuaderno', 3.5, 2), (101, 'Lápiz', 0.9, 10), (102, 'Mochila', 25, 1), (103, 'Cuaderno', 3.5, 1), (103, 'Goma', 0.6, 3);
```

Para ver **un pedido completo** hay que **juntar** las tablas con `JOIN`:

```sql
SELECT p.id, c.nombre AS cliente, p.fecha, ROUND(SUM(l.precio * l.cantidad), 2) AS total
FROM pedidos p
JOIN clientes c ON c.id = p.id_cliente
JOIN lineas l   ON l.id_pedido = p.id
GROUP BY p.id
ORDER BY p.id;
```

Resultado:

| id | cliente | fecha | total |
|---|---|---|---|
| 101 | Ana | 2025-03-01 | 16.0 |
| 102 | Ana | 2025-03-05 | 25.0 |
| 103 | Luis | 2025-03-07 | 5.3 |

*3 filas*

Una base **documental** (un tipo de no relacional) guarda el **mismo pedido como un único documento**, con el cliente y las líneas **dentro**. Lo que se lee de una vez es lo que se guardó junto:

```json
{
  "cliente": { "nombre": "Ana", "ciudad": "Lugo" },
  "fecha": "2025-03-01",
  "lineas": [
    { "producto": "Cuaderno", "precio": 3.5, "cantidad": 2 },
    { "producto": "Lápiz",    "precio": 0.9, "cantidad": 10 }
  ],
  "etiquetas": ["papelería", "urgente"]
}
```

SQLite puede guardar documentos JSON en una columna y consultarlos, así que sirve para ver la diferencia. **Cada fila de `pedidos_doc` es un pedido completo**:

```sql
CREATE TABLE pedidos_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO pedidos_doc VALUES
 (101, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-01", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 2}, {"producto": "Lápiz", "precio": 0.9, "cantidad": 10}], "etiquetas": ["papelería", "urgente"]}'),
 (102, '{"cliente": {"nombre": "Ana", "ciudad": "Lugo"}, "fecha": "2025-03-05", "lineas": [{"producto": "Mochila", "precio": 25, "cantidad": 1}], "etiquetas": ["mochilas"]}'),
 (103, '{"cliente": {"nombre": "Luis", "ciudad": "Vigo"}, "fecha": "2025-03-07", "lineas": [{"producto": "Cuaderno", "precio": 3.5, "cantidad": 1}, {"producto": "Goma", "precio": 0.6, "cantidad": 3}], "etiquetas": ["papelería", "urgente"]}');
```

Y ahora, el mismo resultado de antes, **sin ningún `JOIN`** (los operadores `->>` leen un campo del JSON, y `json_each` recorre una lista):

```sql
SELECT d.id,
       d.doc ->> '$.cliente.nombre' AS cliente,
       d.doc ->> '$.fecha'          AS fecha,
       ROUND((SELECT SUM(l.value ->> '$.precio' * (l.value ->> '$.cantidad'))
              FROM json_each(d.doc, '$.lineas') AS l), 2) AS total
FROM pedidos_doc d
ORDER BY d.id;
```

Resultado:

| id | cliente | fecha | total |
|---|---|---|---|
| 101 | Ana | 2025-03-01 | 16.0 |
| 102 | Ana | 2025-03-05 | 25.0 |
| 103 | Luis | 2025-03-07 | 5.3 |

*3 filas*

Los dos dan lo mismo, pero **por caminos opuestos**:

| | Relacional | Documental |
|---|---|---|
| ¿Dónde está el cliente? | **Una sola vez**, en `clientes` | **Copiado** dentro de cada pedido |
| Leer un pedido completo | **Varias tablas** y `JOIN` | **Un único documento**, de golpe |
| Cambiar la ciudad de Ana | **Un `UPDATE`** | Tocar **todos** sus pedidos |

Esa tabla resume casi todo lo demás.

## Las diferencias, una a una

| Característica | Relacional (SQL) | No relacional (NoSQL) |
|---|---|---|
| **Modelo** | Tablas con filas y columnas | Documentos, clave-valor, columnas o grafos |
| **Esquema** | **Fijo y obligatorio**: las columnas y tipos se declaran antes | **Flexible**: cada elemento puede tener campos distintos |
| **Relaciones** | Con **claves foráneas** y `JOIN` | Datos **anidados** o referencias que gestiona el programa |
| **Duplicación** | Se **evita** (normalización) | Se **acepta** (desnormalización) para leer rápido |
| **Consultas** | **SQL**, estándar y muy potente | Cada motor tiene **su propio lenguaje** o API |
| **Consistencia** | **ACID**: transacciones completas | Suele ser **BASE**: se prima disponibilidad y velocidad |
| **Crecer** | Sobre todo **vertical** (un servidor más potente) | Sobre todo **horizontal** (repartir entre muchos servidores) |
| **Ideal para** | Datos **estructurados** con muchas relaciones y reglas | Datos **variables**, enormes cantidades o relaciones complejas |

!!! note "¿NoSQL significa «sin SQL»?"
    No exactamente. La sigla se entiende hoy como ***Not only SQL*** («no solo SQL»): son bases que no se limitan al modelo de tablas. Algunas incluso ofrecen lenguajes parecidos a SQL, y muchas bases relacionales (SQLite, PostgreSQL, MySQL) también guardan JSON, como acabas de ver.

## Esquema fijo frente a esquema flexible

En una base relacional **todas las filas de una tabla tienen las mismas columnas**, y el motor **rechaza** lo que no cumple las reglas:

```sql
INSERT INTO clientes (id, nombre) VALUES (3, 'Marta');
```

Resultado: **error**

```text
IntegrityError: NOT NULL constraint failed: clientes.ciudad
```

En una base documental **cada documento puede ser distinto**. Aquí un pedido con un campo que los demás no tienen (`regalo`) y otro sin líneas:

```sql
INSERT INTO pedidos_doc VALUES
 (104, '{"cliente": {"nombre": "Marta", "ciudad": "León"}, "fecha": "2025-03-09", "regalo": {"para": "Pablo", "mensaje": "¡Felicidades!"}, "lineas": [{"producto": "Libreta", "precio": 6, "cantidad": 1}]}');

SELECT id,
       doc ->> '$.cliente.nombre' AS cliente,
       doc ->> '$.regalo.para'    AS regalo_para,
       json_array_length(doc, '$.etiquetas') AS n_etiquetas
FROM pedidos_doc
ORDER BY id;
```

Resultado:

| id | cliente | regalo_para | n_etiquetas |
|---|---|---|---|
| 101 | Ana | NULL | 2 |
| 102 | Ana | NULL | 1 |
| 103 | Luis | NULL | 2 |
| 104 | Marta | Pablo | NULL |

*4 filas*

Lo que no existe devuelve `NULL` (el pedido sin `regalo` no da error). Esa libertad es muy cómoda cuando los datos **cambian a menudo**: productos con características distintas, formularios que evolucionan, datos que llegan de varias fuentes. Pero tiene un precio. El motor **no impide** que entre un documento absurdo:

```sql
INSERT INTO pedidos_doc VALUES (105, '{"cliente": 42, "fecha": "ayer", "lineas": "ninguna"}');

SELECT id, json_type(doc, '$.cliente') AS tipo_cliente, doc ->> '$.fecha' AS fecha FROM pedidos_doc WHERE id >= 104 ORDER BY id;
```

Resultado:

| id | tipo_cliente | fecha |
|---|---|---|
| 105 | integer | ayer |

*1 fila*

`json_valid` solo comprueba que sea JSON bien formado; el documento 105 tiene un «cliente» que es un **número** y una fecha que es «ayer». **El motor lo acepta.** La validación pasa a ser responsabilidad de **tu programa** (aunque algunos motores, como MongoDB, permiten añadir reglas de validación opcionales).

## La duplicación: rápido de leer, difícil de mantener

Fíjate en que el cliente «Ana» está **copiado en dos pedidos**. Si Ana se muda a Vigo y solo se actualiza uno, los datos **se contradicen**:

```sql
UPDATE pedidos_doc SET doc = json_set(doc, '$.cliente.ciudad', 'Vigo') WHERE id = 101;   -- ¡nos olvidamos del 102!

SELECT id, doc ->> '$.cliente.nombre' AS cliente, doc ->> '$.cliente.ciudad' AS ciudad FROM pedidos_doc WHERE doc ->> '$.cliente.nombre' = 'Ana' ORDER BY id;
```

Resultado:

| id | cliente | ciudad |
|---|---|---|
| 101 | Ana | Vigo |
| 102 | Ana | Lugo |

*2 filas*

Ana vive en Vigo y en Lugo **a la vez**. En el modelo relacional ese error **no puede ocurrir**, porque la ciudad está en un único sitio:

```sql
UPDATE clientes SET ciudad = 'Vigo' WHERE id = 1;

SELECT p.id, c.nombre, c.ciudad FROM pedidos p JOIN clientes c ON c.id = p.id_cliente WHERE c.nombre = 'Ana' ORDER BY p.id;
```

Resultado:

| id | nombre | ciudad |
|---|---|---|
| 101 | Ana | Vigo |
| 102 | Ana | Vigo |

*2 filas*

Es el problema que la [normalización](../u02/03-normalizacion.md) resolvía. Las bases no relacionales **eligen ceder en esto** a cambio de otra cosa (velocidad de lectura, flexibilidad, escala) y **asumen que el programador mantiene la coherencia**.

## ACID, BASE y el teorema CAP

### ACID: las promesas de una transacción relacional

| Letra | Significa | Ejemplo |
|---|---|---|
| **A**tomicidad | Todo o nada | Una transferencia resta y suma, o no hace ninguna de las dos |
| **C**onsistencia | Las reglas (claves, `CHECK`) siempre se cumplen | No queda un pedido de un cliente que no existe |
| **A**islamiento | Dos usuarios a la vez no se pisan | Visto en la [U6](../u06/04-transacciones.md) y en la [SA4](../avanzado/a4/index.md) |
| **D**urabilidad | Lo confirmado **no se pierde** aunque se apague el servidor | Tras el `COMMIT`, el dato está a salvo |

### BASE: otra filosofía

Para repartir los datos entre **muchos servidores** y seguir funcionando aunque alguno falle, muchas bases no relacionales ofrecen garantías más débiles, resumidas en **BASE**:

* ***B**asically **A**vailable*: el sistema **casi siempre responde**.
* ***S**oft state*: el estado puede **cambiar sin que nadie escriba** mientras las copias se sincronizan.
* ***E**ventually consistent*: las copias **acabarán coincidiendo**, pero no de inmediato.

En la práctica: si escribes en un servidor y lees **un instante después de otro**, puede que **aún no veas tu cambio**. Para un «me gusta» o un contador de visitas es aceptable; para un saldo bancario, no.

### El teorema CAP

Cuando los datos están **repartidos en varios servidores** hay tres propiedades deseables, y el teorema CAP dice que **ante un fallo de la red entre ellos no se pueden tener las tres**:

| Propiedad | Significa |
|---|---|
| **C**onsistency (consistencia) | Todos ven **el mismo dato** a la vez |
| **A**vailability (disponibilidad) | **Todas las peticiones reciben respuesta** |
| **P**artition tolerance (tolerancia a particiones) | El sistema **sigue funcionando** aunque se corte la comunicación entre servidores |

Como los cortes de red **ocurren de verdad**, la elección real es entre **consistencia** (negarse a responder hasta estar seguro) y **disponibilidad** (responder con lo que se tiene, aunque pueda estar desfasado). No es «relacional = bueno, NoSQL = malo»: **cada sistema elige** según lo que su aplicación puede permitirse.

## Cuándo usar cada una

| Si tu caso es… | Piensa en… | Por qué |
|---|---|---|
| Datos con **muchas relaciones y reglas** (facturas, notas, banca) | **Relacional** | Integridad y transacciones, sin duplicar |
| Datos que **cambian de forma** (catálogos con atributos distintos, contenidos) | **Documental** | Esquema flexible; se lee un elemento completo de golpe |
| **Caché**, sesiones, contadores, colas | **Clave-valor** | Lecturas y escrituras ultrarrápidas |
| **Millones de eventos** (sensores, registros, mensajes) | **Columnas anchas** | Escritura masiva y escala horizontal |
| **Redes** de relaciones (amigos, recomendaciones, rutas) | **Grafos** | Recorrer relaciones es su especialidad |

!!! tip "No tienes que elegir solo una"
    Las aplicaciones grandes usan **varias a la vez** (*persistencia políglota*): por ejemplo, **PostgreSQL** para pedidos y pagos, **Redis** como caché de sesiones y un motor de **grafos** para las recomendaciones. Cada herramienta, para lo que mejor hace.

## Errores y mitos frecuentes

| Mito o error | La realidad |
|---|---|
| «NoSQL es más moderno, así que es mejor» | Resuelve **otros problemas**; para datos con reglas y relaciones, una relacional suele ser la mejor |
| «Sin esquema, me ahorro diseñar» | El esquema **sigue existiendo**, pero en tu código: lo pagas después |
| «NoSQL siempre es más rápido» | Lo es para **lo que se diseñó**; las consultas «raras» pueden ser muy lentas |
| «Las relacionales no escalan» | Escalan mucho (y hoy muchas se reparten entre servidores); simplemente es **más complejo** |
| «En NoSQL no hay transacciones» | Depende del motor: MongoDB las admite entre documentos (más costosas que en una relacional) |
| Copiar datos «por si acaso» | Cada copia es una **contradicción en potencia**: decide cuál es la fuente de la verdad |

## Para practicar

Los ejercicios S7.1 a S7.3 de [S7 · Ejercicios](ejercicios.md) practican la lectura de documentos JSON con SQLite.
