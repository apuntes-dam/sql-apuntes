# 7.2 Los cuatro tipos de bases no relacionales

!!! info "Qué se ha ejecutado y qué no"
    En esta unidad **no hay un servidor de MongoDB, Redis, Cassandra ni Neo4j**. Lo que ves con resultado se ha **ejecutado de verdad en SQLite**, que sabe **guardar y consultar documentos JSON**: sirve para ver el *modelo* de datos y sus consecuencias, aunque no es una base de datos documental completa. Los modelos en Python están marcados como **didácticos** (explican la idea, no son un motor real). Las órdenes de los motores de verdad se muestran como «**sin ejecutar**»: necesitan instalar su servidor.

«No relacional» es un cajón grande. Los motores se agrupan en **cuatro familias**, según cómo guardan los datos.

## 1. Documentales

Guardan **documentos** (normalmente JSON), agrupados en **colecciones** (el equivalente a una tabla). Cada documento es **autosuficiente** y puede tener su propia forma.

* **Motores:** MongoDB, CouchDB, Firestore (Firebase).
* **Ideal para:** catálogos de productos, perfiles de usuario, contenidos, aplicaciones que **evolucionan rápido**.
* **No tan bueno para:** datos con **muchas relaciones cruzadas** entre colecciones.

Una consulta en MongoDB (la base documental más usada) se ve así:

```javascript
// Sin ejecutar: necesita un servidor MongoDB
// Pedidos de clientes de Lugo, solo con el nombre y la fecha
db.pedidos.find({ "cliente.ciudad": "Lugo" }, { "cliente.nombre": 1, fecha: 1 })

// El total de cada pedido: se «despliega» la lista de líneas y se suma
db.pedidos.aggregate([
  { $unwind: "$lineas" },
  { $group: { _id: "$_id", total: { $sum: { $multiply: ["$lineas.precio", "$lineas.cantidad"] } } } }
])
```

La misma idea de filtrar por un campo anidado, ejecutada de verdad con los documentos JSON de SQLite (la ciudad está **dentro** del documento, en `cliente.ciudad`):

```sql
SELECT id, doc ->> '$.cliente.nombre' AS cliente, doc ->> '$.fecha' AS fecha
FROM pedidos_doc
WHERE doc ->> '$.cliente.ciudad' = 'Lugo'
ORDER BY id;
```

Resultado:

| id | cliente | fecha |
|---|---|---|
| 101 | Ana | 2025-03-01 |
| 102 | Ana | 2025-03-05 |

*2 filas*

Y la parte de «desplegar la lista y agrupar» (el `$unwind` y `$group` de MongoDB), con `json_each`:

```sql
SELECT d.id,
       ROUND(SUM(l.value ->> '$.precio' * (l.value ->> '$.cantidad')), 2) AS total
FROM pedidos_doc d, json_each(d.doc, '$.lineas') AS l
GROUP BY d.id
ORDER BY d.id;
```

Resultado:

| id | total |
|---|---|
| 101 | 16.0 |
| 102 | 25.0 |
| 103 | 5.3 |

*3 filas*

## 2. Clave-valor

La más sencilla: un **diccionario gigante**. A cada **clave** le corresponde un **valor** y la única forma de buscar es **por la clave**. Es increíblemente rápida precisamente porque no hace nada más.

* **Motores:** Redis, Amazon DynamoDB, Memcached.
* **Ideal para:** **cachés**, **sesiones** de usuario, contadores, colas, tablas de clasificación.
* **No tan bueno para:** preguntar «dame todos los valores que cumplan tal condición»: **solo se busca por clave**.

```text
Sin ejecutar: necesita un servidor Redis (órdenes de redis-cli)
SET sesion:42 "ana" EX 3600      # guarda la sesión de Ana; caduca en una hora
GET sesion:42                    # → "ana"
TTL sesion:42                    # segundos que le quedan
INCR visitas                     # suma 1 al contador (atómico): 1, 2, 3...
HSET usuario:1 nombre Ana ciudad Lugo      # un «hash»: varios campos bajo una clave
HGETALL usuario:1
```

El corazón de esta familia cabe en pocas líneas de Python. **Es un modelo didáctico, no un motor real**: sirve para ver cómo funcionan las **claves con caducidad** (`EX`) y los contadores (`INCR`). El reloj se simula con una variable para no tener que esperar:

```python
class ClaveValor:
    """Modelo DIDÁCTICO de una base clave-valor con caducidad (la idea de Redis, en miniatura)."""
    def __init__(self, reloj):
        self.datos = {}
        self.reloj = reloj

    def set(self, clave, valor, ex=None):                 # ex = segundos hasta que caduca
        self.datos[clave] = (valor, None if ex is None else self.reloj() + ex)

    def get(self, clave):
        if clave not in self.datos:
            return None
        valor, caduca = self.datos[clave]
        if caduca is not None and self.reloj() >= caduca:  # ya caducó: se borra al consultarla
            del self.datos[clave]
            return None
        return valor

    def incr(self, clave):
        n = int(self.get(clave) or 0) + 1
        self.set(clave, n)
        return n

ahora = [0]                                                # un reloj de mentira
db = ClaveValor(lambda: ahora[0])

db.set("sesion:42", "ana", ex=3600)
print("a los 0 s:      ", db.get("sesion:42"))
ahora[0] = 3599
print("a los 3599 s:   ", db.get("sesion:42"))
ahora[0] = 3600
print("a los 3600 s:   ", db.get("sesion:42"))
print("visitas:        ", db.incr("visitas"), db.incr("visitas"), db.incr("visitas"))
print("buscar por valor: no hay forma directa, solo por clave ->", db.get("ana"))
```

Salida:

```text
a los 0 s:       ana
a los 3599 s:    ana
a los 3600 s:    None
visitas:         1 2 3
buscar por valor: no hay forma directa, solo por clave -> None
```

## 3. De columnas anchas

Parecen tablas, pero **cada fila puede tener columnas distintas** y los datos se reparten entre servidores según una **clave de partición**. Se diseñan **pensando en las consultas**: en lugar de una tabla normalizada y muchos `JOIN`, se crea **una tabla por cada consulta** que la aplicación necesita, aunque eso **duplique los datos**.

* **Motores:** Apache Cassandra, HBase, ScyllaDB.
* **Ideal para:** **cantidades enormes de escrituras** (sensores, registros, mensajes, series temporales) y **escalar a muchos servidores**.
* **No tan bueno para:** consultas improvisadas: solo se pueden hacer bien las que **se diseñaron de antemano**.

```text
Sin ejecutar: necesita un servidor Cassandra (CQL, un lenguaje parecido a SQL)
CREATE TABLE pedidos_por_cliente (
  cliente   text,
  fecha     date,
  id_pedido int,
  total     decimal,
  PRIMARY KEY ((cliente), fecha, id_pedido)      -- «cliente» reparte los datos; «fecha» los ordena dentro de cada cliente
) WITH CLUSTERING ORDER BY (fecha DESC);

SELECT * FROM pedidos_por_cliente WHERE cliente = 'Ana' LIMIT 10;   -- los 10 últimos pedidos de Ana: muy rápida
```

La idea de **«una tabla por consulta»** se puede ver con SQLite: los **mismos pedidos** guardados dos veces, cada copia organizada para **una pregunta**. Cada pregunta es instantánea, a cambio de **escribir cada pedido dos veces**:

```sql
CREATE TABLE pedidos_por_cliente (cliente TEXT, fecha TEXT, id_pedido INTEGER, total REAL, PRIMARY KEY (cliente, fecha, id_pedido));
CREATE TABLE pedidos_por_dia     (fecha TEXT, cliente TEXT, id_pedido INTEGER, total REAL, PRIMARY KEY (fecha, cliente, id_pedido));

-- Cada pedido se escribe EN LAS DOS tablas
INSERT INTO pedidos_por_cliente VALUES ('Ana', '2025-03-01', 101, 16.0), ('Ana', '2025-03-05', 102, 25.0), ('Luis', '2025-03-07', 103, 5.3);
INSERT INTO pedidos_por_dia     VALUES ('2025-03-01', 'Ana', 101, 16.0), ('2025-03-05', 'Ana', 102, 25.0), ('2025-03-07', 'Luis', 103, 5.3);

-- Pregunta 1: los pedidos de Ana, del más reciente al más antiguo
SELECT fecha, id_pedido, total FROM pedidos_por_cliente WHERE cliente = 'Ana' ORDER BY fecha DESC;
```

Resultado:

| fecha | id_pedido | total |
|---|---|---|
| 2025-03-05 | 102 | 25.0 |
| 2025-03-01 | 101 | 16.0 |

*2 filas*

```sql
-- Pregunta 2: todo lo que se vendió el 7 de marzo (la otra copia, organizada por día)
SELECT cliente, id_pedido, total FROM pedidos_por_dia WHERE fecha = '2025-03-07';
```

Resultado:

| cliente | id_pedido | total |
|---|---|---|
| Luis | 103 | 5.3 |

*1 fila*

La primera pregunta usa la copia ordenada **por cliente**; la segunda, la ordenada **por día**. En Cassandra, cada una de esas copias es una tabla **pensada para su consulta**, y la aplicación se encarga de escribir en las dos.

## 4. De grafos

Guardan **nodos** (las cosas: personas, productos) y **aristas** (las relaciones entre ellas: «es amigo de», «compró»), y ambos pueden llevar propiedades. Su especialidad es **recorrer relaciones**: «los amigos de mis amigos», «quien compró esto también compró…», «la ruta más corta».

* **Motores:** Neo4j, Amazon Neptune, ArangoDB.
* **Ideal para:** **redes sociales**, **recomendaciones**, detección de fraude, rutas, conocimiento enlazado.
* **No tan bueno para:** datos que **no son relaciones** (una lista de productos) o consultas masivas sobre todos los nodos.

```text
Sin ejecutar: necesita un servidor Neo4j (lenguaje Cypher: se «dibuja» el patrón)
// Los amigos de los amigos de Ana (que no sean ella)
MATCH (a:Persona {nombre: 'Ana'})-[:AMIGO_DE]-()-[:AMIGO_DE]-(f:Persona)
WHERE f <> a
RETURN DISTINCT f.nombre
```

En SQL se puede hacer, pero **cada salto exige otro `JOIN`**. Con una tabla de amistades, «amigos de amigos» es un `JOIN` de la tabla consigo misma (las amistades van en **los dos sentidos**, así que primero se «dobla» la tabla):

```sql
WITH vecinos(x, y) AS (SELECT a, b FROM amistades UNION SELECT b, a FROM amistades)
SELECT DISTINCT v2.y AS amigo_de_amigo
FROM vecinos v1
JOIN vecinos v2 ON v2.x = v1.y
WHERE v1.x = 'Ana'
  AND v2.y <> 'Ana'
  AND v2.y NOT IN (SELECT y FROM vecinos WHERE x = 'Ana')     -- que no sean ya amigos directos
ORDER BY amigo_de_amigo;
```

Resultado:

| amigo_de_amigo |
|---|
| Pablo |
| Sara |

*2 filas*

Para «hasta cuántos saltos» ya hay que usar una consulta **recursiva** (la de la [SA2](../avanzado/a2/index.md)):

```sql
WITH RECURSIVE vecinos(x, y) AS (SELECT a, b FROM amistades UNION SELECT b, a FROM amistades),
alcance(nombre, saltos) AS (
  SELECT 'Ana', 0
  UNION
  SELECT v.y, a.saltos + 1 FROM alcance a JOIN vecinos v ON v.x = a.nombre WHERE a.saltos < 3
)
SELECT nombre, MIN(saltos) AS saltos FROM alcance GROUP BY nombre ORDER BY saltos, nombre;
```

Resultado:

| nombre | saltos |
|---|---|
| Ana | 0 |
| Luis | 1 |
| Marta | 1 |
| Pablo | 2 |
| Sara | 2 |
| Eva | 3 |

*6 filas*

Con **seis amistades** se resuelve sin problema. Con **millones de personas**, cada salto adicional multiplica el trabajo de los `JOIN`; una base de grafos guarda las relaciones **como enlaces directos entre nodos**, así que recorrerlas **cuesta lo mismo** aunque la base sea enorme. Esa es su razón de existir.

## Resumen

| Tipo | Motores | Se guarda como | Se busca por | Ideal para |
|---|---|---|---|---|
| **Documental** | MongoDB, Firestore | Documentos JSON en colecciones | Campos del documento | Catálogos, perfiles, contenidos |
| **Clave-valor** | Redis, DynamoDB | Pares clave → valor | **Solo la clave** | Cachés, sesiones, contadores |
| **Columnas anchas** | Cassandra, HBase | Filas por clave de partición | Clave de partición | Escritura masiva, series temporales |
| **Grafos** | Neo4j, Neptune | Nodos y aristas | Patrones de relaciones | Redes, recomendaciones |

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Usar Redis como base de datos principal sin pensar en la persistencia | Es ideal como **caché**; si es la única copia, configura la persistencia y las copias de seguridad |
| Diseñar Cassandra «como una relacional» | Se diseña **a partir de las consultas**, una tabla por cada una |
| Pedirle a un clave-valor una búsqueda por valor | Solo se consulta por clave; para otra cosa, otra base |
| Meter en una base de grafos datos que no son relaciones | Úsala para lo que son **redes**; el resto, en otra |
| Instalar cuatro motores «por si acaso» | Cada uno es algo que **mantener**: elige solo los que resuelven un problema real |

## Para practicar

Los ejercicios S7.4 y S7.5 de [S7 · Ejercicios](ejercicios.md) practican la construcción de documentos y los recorridos de relaciones.
