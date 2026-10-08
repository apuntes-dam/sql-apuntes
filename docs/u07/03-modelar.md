# 7.3 Modelar y elegir

!!! info "Qué se ha ejecutado y qué no"
    En esta unidad **no hay un servidor de MongoDB, Redis, Cassandra ni Neo4j**. Lo que ves con resultado se ha **ejecutado de verdad en SQLite**, que sabe **guardar y consultar documentos JSON**: sirve para ver el *modelo* de datos y sus consecuencias, aunque no es una base de datos documental completa. Los modelos en Python están marcados como **didácticos** (explican la idea, no son un motor real). Las órdenes de los motores de verdad se muestran como «**sin ejecutar**»: necesitan instalar su servidor.

## La gran decisión de las bases documentales: ¿embeber o referenciar?

En una base relacional modelas **por entidades** y las unes con `JOIN`. En una documental la pregunta cambia: ¿esta información va **dentro** del documento (**embeber**) o en **otro documento** al que apuntar (**referenciar**)?

Un blog, en las dos versiones. Con los **comentarios embebidos**, cada entrada lleva sus comentarios dentro; con **referencias** (a la relacional), los comentarios están aparte y apuntan a su entrada:

```sql
CREATE TABLE posts_doc (id INTEGER PRIMARY KEY, doc TEXT NOT NULL CHECK (json_valid(doc)));
INSERT INTO posts_doc VALUES
 (1, '{"titulo": "Hola mundo", "autor": "Ana", "comentarios": [{"autor": "Luis", "texto": "¡Bienvenida!"}, {"autor": "Marta", "texto": "Qué bien"}]}'),
 (2, '{"titulo": "Mi primera base de datos", "autor": "Ana", "comentarios": []}'),
 (3, '{"titulo": "Elegir una base de datos", "autor": "Luis", "comentarios": [{"autor": "Ana", "texto": "Muy útil"}]}');
CREATE TABLE posts (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, autor TEXT NOT NULL);
CREATE TABLE comentarios (id INTEGER PRIMARY KEY, id_post INTEGER NOT NULL REFERENCES posts(id), autor TEXT NOT NULL, texto TEXT NOT NULL);
INSERT INTO posts VALUES (1, 'Hola mundo', 'Ana'), (2, 'Mi primera base de datos', 'Ana'), (3, 'Elegir una base de datos', 'Luis');
INSERT INTO comentarios (id_post, autor, texto) VALUES (1, 'Luis', '¡Bienvenida!'), (1, 'Marta', 'Qué bien'), (3, 'Ana', 'Muy útil');
```

Contar los comentarios de cada entrada, en cada modelo:

```sql
-- Embebidos: la lista viaja dentro del documento
SELECT id, doc ->> '$.titulo' AS titulo, json_array_length(doc, '$.comentarios') AS comentarios
FROM posts_doc ORDER BY id;
```

Resultado:

| id | titulo | comentarios |
|---|---|---|
| 1 | Hola mundo | 2 |
| 2 | Mi primera base de datos | 0 |
| 3 | Elegir una base de datos | 1 |

*3 filas*

```sql
-- Referenciados: hay que juntar dos tablas
SELECT p.id, p.titulo, COUNT(c.id) AS comentarios
FROM posts p LEFT JOIN comentarios c ON c.id_post = p.id
GROUP BY p.id ORDER BY p.id;
```

Resultado:

| id | titulo | comentarios |
|---|---|---|
| 1 | Hola mundo | 2 |
| 2 | Mi primera base de datos | 0 |
| 3 | Elegir una base de datos | 1 |

*3 filas*

El resultado es el mismo. La diferencia es **lo que cuesta cada cosa**: con comentarios embebidos, **mostrar una entrada con sus comentarios es una sola lectura**. Con referencias, hacen falta dos consultas o un `JOIN`. A cambio, **añadir un comentario** modifica el documento entero (y si una entrada tuviera un millón de comentarios, el documento sería enorme).

### Una regla práctica

| Embeber cuando… | Referenciar cuando… |
|---|---|
| Los datos **se leen siempre juntos** | Los datos **se consultan por separado** |
| Hay **pocos** elementos (un pedido y sus 5 líneas) | Pueden ser **muchísimos o crecer sin límite** (los comentarios de una entrada famosa) |
| Los datos **casi no cambian** después | Los datos **cambian a menudo** y los comparten varios documentos (el nombre de un cliente) |
| El hijo **no tiene sentido sin el padre** (las líneas de un pedido) | El hijo **tiene vida propia** (un usuario que escribe en muchas entradas) |

Un buen diseño suele **mezclar**: el pedido **embebe sus líneas** (siempre juntas) pero **referencia al cliente** por su identificador (compartido y cambiante), quizá copiando solo el nombre para mostrarlo rápido.

## Consultar documentos

### Filtrar y listar

Los documentos pueden tener **listas dentro**. Para preguntar «¿qué pedidos tienen la etiqueta *urgente*?», hay que mirar **dentro** de la lista:

```sql
SELECT id, doc ->> '$.cliente.nombre' AS cliente
FROM pedidos_doc
WHERE EXISTS (SELECT 1 FROM json_each(doc, '$.etiquetas') WHERE value = 'urgente')
ORDER BY id;
```

Resultado:

| id | cliente |
|---|---|
| 101 | Ana |
| 103 | Luis |

*2 filas*

### Agrupar por algo que está dentro de una lista

¿Cuántos pedidos hay por etiqueta? Se **despliega** la lista (cada etiqueta pasa a ser una fila) y se agrupa:

```sql
SELECT value AS etiqueta, COUNT(*) AS pedidos
FROM pedidos_doc, json_each(doc, '$.etiquetas')
GROUP BY value
ORDER BY pedidos DESC, etiqueta;
```

Resultado:

| etiqueta | pedidos |
|---|---|
| papelería | 2 |
| urgente | 2 |
| mochilas | 1 |

*3 filas*

### Pasar de tablas a documentos

Y al revés: construir **un documento por cliente** con sus pedidos dentro, a partir de las tablas. Es lo que hace una aplicación cuando «prepara» los datos para enviarlos a una web:

```sql
SELECT json_object(
         'cliente', c.nombre,
         'ciudad',  c.ciudad,
         'pedidos', (SELECT json_group_array(json_object('id', p.id, 'fecha', p.fecha))
                     FROM (SELECT id, fecha FROM pedidos WHERE id_cliente = c.id ORDER BY id) AS p)
       ) AS documento
FROM clientes c
ORDER BY c.id;
```

Resultado:

| documento |
|---|
| {"cliente":"Ana","ciudad":"Lugo","pedidos":[{"id":101,"fecha":"2025-03-01"},{"id":102,"fecha":"2025-03-05"}]} |
| {"cliente":"Luis","ciudad":"Vigo","pedidos":[{"id":103,"fecha":"2025-03-07"}]} |

*2 filas*

### Modificar dentro de un documento

Se cambia **un campo** sin reescribir el documento entero (y fíjate en el aviso de antes: si ese dato está **copiado** en otros documentos, hay que cambiarlos **todos**):

```sql
UPDATE pedidos_doc
SET doc = json_set(doc, '$.estado', 'enviado')          -- añade (o cambia) el campo «estado»
WHERE doc ->> '$.cliente.nombre' = 'Ana';

UPDATE pedidos_doc
SET doc = json_remove(doc, '$.etiquetas')               -- quita un campo
WHERE id = 102;

SELECT id, doc ->> '$.estado' AS estado, json_type(doc, '$.etiquetas') AS tipo_etiquetas FROM pedidos_doc ORDER BY id;
```

Resultado:

| id | estado | tipo_etiquetas |
|---|---|---|
| 101 | enviado | array |
| 102 | enviado | NULL |
| 103 | NULL | array |

*3 filas*

## Índices también en documentos

Buscar dentro de miles de documentos recorriéndolos todos es lento, igual que en una tabla sin índice. Las bases documentales permiten **indexar un campo del documento**. En SQLite se hace con un índice sobre la expresión, y el plan de ejecución lo confirma (la columna importante es `detail`):

```sql
CREATE INDEX idx_ciudad ON pedidos_doc ((doc ->> '$.cliente.ciudad'));

EXPLAIN QUERY PLAN
SELECT id FROM pedidos_doc WHERE doc ->> '$.cliente.ciudad' = 'Lugo';
```

Resultado:

| id | parent | notused | detail |
|---|---|---|---|
| 3 | 0 | 53 | SEARCH pedidos_doc USING COVERING INDEX idx_ciudad (<expr>=?) |

*1 fila*

`SEARCH ... USING COVERING INDEX idx_ciudad` significa que **va directo a los documentos de esa ciudad** sin recorrer todos (*covering*: el índice ya contiene lo que se pide, así que ni siquiera abre la tabla). (Más sobre planes en la [SA3](../avanzado/a3/index.md).)

## Transacciones y consistencia

* **Un documento se escribe de golpe.** Cambiar un pedido y sus líneas, **si están en el mismo documento**, es una sola operación atómica. Esa es una ventaja de embeber.
* **Repartir un cambio entre varios documentos** (restar saldo de uno y sumar a otro) **ya necesita una transacción**. Las bases documentales modernas, como MongoDB, las ofrecen **entre documentos**, pero son más costosas que en una relacional y se evitan siempre que se pueda.
* Si tu aplicación necesita **muchas** de esas operaciones (banca, facturación, reservas), es una señal de que **la relacional** puede ser una elección más natural.

## Cambiar la forma de los datos: versiones

Con esquema flexible, **los documentos antiguos no se actualizan solos** cuando cambias la estructura. Una costumbre muy útil es guardar un campo `"version"` en cada documento y que la aplicación **sepa leer las versiones antiguas** (y los migre al guardarlos). Es el mismo patrón que verás en la web de [HTML, CSS y JavaScript](https://apuntes-dam.github.io/web-apuntes/avanzado/a2/02-apis/) para los datos de `localStorage`.

## Cómo elegir: una guía rápida

Hazte estas preguntas **por orden**:

1. **¿Mis datos tienen muchas relaciones y reglas que no pueden romperse?** → **Relacional**.
2. **¿Necesito transacciones entre varias cosas a la vez?** → **Relacional** (o una documental que las soporte, pagando su coste).
3. **¿Cada elemento tiene su propia forma y se lee siempre entero?** → **Documental**.
4. **¿Solo busco por una clave, a toda velocidad (caché, sesiones)?** → **Clave-valor**.
5. **¿Escribo millones de eventos y necesito repartirlos?** → **Columnas anchas**.
6. **¿Lo importante son las relaciones entre las cosas (amigos, recomendaciones)?** → **Grafos**.
7. **¿Dudas?** → Empieza con una **relacional**: es la opción más versátil, y muchas ya guardan JSON para cuando lo necesites.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Embeber una lista que puede crecer sin límite | Referenciar: documentos de un tamaño razonable |
| Copiar datos que cambian a menudo en muchos documentos | Referenciarlos y copiar solo lo imprescindible para mostrarlos |
| Dejar sin índice los campos por los que se filtra | Indexar los campos de las consultas habituales |
| No guardar la versión del documento | Un campo `version` y código que migre los antiguos |
| Elegir la base por moda, sin saber qué consultas harás | Primero las **consultas**, después el motor |
| Usar una base documental para datos muy relacionales y transaccionales | Una relacional |

## Para practicar

Los ejercicios S7.3 a S7.6 de [S7 · Ejercicios](ejercicios.md) practican consultar, construir y modificar documentos y recorrer relaciones.
