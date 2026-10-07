# 2.3 Normalización

La **normalización** es un conjunto de reglas para que cada dato se guarde **en un solo sitio** y las tablas estén bien organizadas. Se aplica al **modelo lógico** (las tablas) y evita los problemas de los datos repetidos.

## El problema: una tabla que lo guarda todo

Un diseño muy frecuente entre quien empieza es meter **todo en una sola tabla**:

```sql
CREATE TABLE ventas_mal (
  id_venta  INTEGER PRIMARY KEY,
  cliente   TEXT,
  email     TEXT,
  ciudad    TEXT,
  producto  TEXT,
  precio    REAL,
  cantidad  INTEGER
);
INSERT INTO ventas_mal VALUES
  (1, 'Ana Gil',    'ana@mail.com',   'Cádiz',   'Teclado', 25.0, 1),
  (2, 'Ana Gil',    'ana@mail.com',   'Cádiz',   'Ratón',   12.5, 2),
  (3, 'Luis Romero','luis@mail.com',  'Sevilla', 'Teclado', 25.0, 1),
  (4, 'Ana Gil',    'ana@mail.com',   'Cádiz',   'Monitor', 140.0, 1);
SELECT * FROM ventas_mal;
```

Resultado:

| id_venta | cliente | email | ciudad | producto | precio | cantidad |
|---|---|---|---|---|---|---|
| 1 | Ana Gil | ana@mail.com | Cádiz | Teclado | 25.0 | 1 |
| 2 | Ana Gil | ana@mail.com | Cádiz | Ratón | 12.5 | 2 |
| 3 | Luis Romero | luis@mail.com | Sevilla | Teclado | 25.0 | 1 |
| 4 | Ana Gil | ana@mail.com | Cádiz | Monitor | 140.0 | 1 |

*4 filas*

Funciona, pero fíjate en lo que se repite: los datos de **Ana** (nombre, correo y ciudad) aparecen **tres veces**, y el precio del **teclado**, dos. Eso provoca tres tipos de problemas, llamados **anomalías**:

| Anomalía | Ejemplo en esta tabla |
|---|---|
| **De actualización** | Ana cambia de correo: hay que modificarlo en **tres filas**. Si se olvida una, la base de datos se contradice a sí misma |
| **De inserción** | No se puede dar de alta un **cliente nuevo** hasta que compre algo, porque no hay dónde guardarlo sin una venta |
| **De borrado** | Si se borra la única venta de Luis, **se pierden también sus datos** de cliente |

La normalización resuelve estos problemas **separando** la información en tablas relacionadas.

## Dependencias funcionales

La idea central: un atributo **depende** de otro si, conociendo el segundo, queda determinado el primero. Aquí, conociendo el cliente se conoce su correo y su ciudad (`cliente → email, ciudad`), y conociendo el producto se conoce su precio (`producto → precio`). Si esas dependencias son entre cosas **distintas de la clave** de la tabla, hay datos mal colocados.

## Las tres primeras formas normales

Una tabla está en una **forma normal** cuando cumple unas condiciones; cada una incluye las anteriores.

### Primera forma normal (1FN): valores atómicos

* Cada celda tiene **un solo valor** (nada de listas).
* No hay **grupos repetidos** de columnas (`telefono1`, `telefono2`, `telefono3`).

❌ Incumple la 1FN:

| id | nombre | telefonos |
|---|---|---|
| 1 | Ana | 600111222, 956333444 |

✅ Solución: una tabla aparte para los teléfonos (como en [2.2](02-del-modelo-a-tablas.md)).

### Segunda forma normal (2FN): toda la clave

Solo importa cuando la **clave primaria es compuesta**. Todo atributo que no es clave debe depender de **toda** la clave, no de una parte.

❌ En una tabla `lineas(id_pedido, id_producto, cantidad, nombre_producto)` con clave `(id_pedido, id_producto)`, el `nombre_producto` depende **solo de `id_producto`**, que es una parte de la clave. Se repetirá en cada pedido que incluya ese producto.

✅ Solución: el nombre del producto va en la tabla `productos`.

### Tercera forma normal (3FN): nada más que la clave

Ningún atributo que no es clave debe depender de **otro atributo que tampoco es clave** (dependencia **transitiva**).

❌ En `alumnos(id, nombre, id_grupo, nombre_grupo)`, el `nombre_grupo` depende de `id_grupo`, que no es la clave. Si un grupo cambia de nombre, hay que cambiarlo en todos sus alumnos.

✅ Solución: el nombre del grupo va en la tabla `grupos`; `alumnos` solo guarda `id_grupo`.

!!! tip "Para recordarlo"
    Todos los atributos dependen de **«la clave (1FN), toda la clave (2FN) y nada más que la clave (3FN)»**.

## La solución al ejemplo

Aplicadas las reglas a `ventas_mal`, queda un diseño con cuatro tablas, donde **cada dato se guarda una sola vez**:

```sql
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE,
  ciudad TEXT NOT NULL
);
CREATE TABLE productos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio REAL NOT NULL
);
CREATE TABLE ventas (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL REFERENCES clientes(id)
);
CREATE TABLE lineas_venta (
  id_venta    INTEGER NOT NULL REFERENCES ventas(id),
  id_producto INTEGER NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL,
  PRIMARY KEY (id_venta, id_producto)
);
INSERT INTO clientes VALUES (1, 'Ana Gil', 'ana@mail.com', 'Cádiz'), (2, 'Luis Romero', 'luis@mail.com', 'Sevilla');
INSERT INTO productos VALUES (1, 'Teclado', 25.0), (2, 'Ratón', 12.5), (3, 'Monitor', 140.0);
SELECT * FROM clientes;
```

Resultado:

| id | nombre | email | ciudad |
|---|---|---|---|
| 1 | Ana Gil | ana@mail.com | Cádiz |
| 2 | Luis Romero | luis@mail.com | Sevilla |

*2 filas*

Ahora el correo de Ana está **en un solo sitio**: cambiarlo es un único `UPDATE`. Se puede dar de alta un cliente sin ventas, y borrar una venta no borra al cliente. Las anomalías han desaparecido.

## ¿Hay que normalizar siempre?

Normalizar hasta la **3FN** es lo recomendable en casi todos los diseños. Existen formas más estrictas (la de Boyce-Codd, la 4FN, la 5FN), pero se usan poco en la práctica.

A veces se **desnormaliza a propósito**: se repite un dato para que las consultas sean más rápidas (por ejemplo, en un informe que se calcula una vez al día). Es una **decisión consciente** con un coste (el dato repetido hay que mantenerlo al día), no un punto de partida.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Una sola tabla con todo | Separa por entidades (una tabla por cada «cosa») |
| Listas dentro de una celda | Una tabla aparte, una fila por valor |
| Guardar el nombre además del `id` en la tabla relacionada | Solo la clave foránea; el nombre se consulta con un `JOIN` |
| Normalizar de más, hasta lo absurdo | Con la 3FN suele bastar |
| Desnormalizar sin necesidad | Hazlo solo con un motivo medido |

## Para practicar

El ejercicio S2.5 de [S2 · Ejercicios](ejercicios.md) pide normalizar una tabla.
