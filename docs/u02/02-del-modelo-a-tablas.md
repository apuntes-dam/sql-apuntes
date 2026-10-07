# 2.2 Del modelo a las tablas

Con el modelo entidad-relación hecho, pasar a tablas es **mecánico**: se siguen unas reglas.

## Las reglas de transformación

| Elemento del modelo | Se convierte en... |
|---|---|
| **Entidad** | Una **tabla**, con una **clave primaria** |
| **Atributo** simple | Una **columna** |
| Atributo **compuesto** | Una columna por cada parte |
| Atributo **multivaluado** | Una **tabla aparte**, con una clave foránea hacia la entidad |
| Atributo **derivado** | Nada: no se guarda |
| Relación **1:N** | Una **clave foránea en la tabla del lado «N»** (el lado «muchos») |
| Relación **N:M** | Una **tabla intermedia** con **dos claves foráneas** (y los atributos de la relación); su clave primaria es la **pareja** de ambas |
| Relación **1:1** | Una clave foránea **con `UNIQUE`** (o, si siempre van juntas, fundir las dos entidades en una tabla) |

La regla del 1:N es la que más se confunde: la clave foránea va **donde está el «muchos»**. Un grupo tiene muchos alumnos, así que la columna `id_grupo` está en `alumnos`, no al revés. (Si se pusiera en `grupos`, cada grupo solo podría tener **un** alumno.)

## Un ejemplo completo: la tienda

El modelo del apartado anterior (categorías, productos, clientes, pedidos y la relación N:M entre pedidos y productos) se convierte en cinco tablas:

```sql
CREATE TABLE categorias (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE productos (
  id           INTEGER PRIMARY KEY,
  nombre       TEXT    NOT NULL,
  precio       REAL    NOT NULL,
  id_categoria INTEGER NOT NULL REFERENCES categorias(id)
);
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  fecha      TEXT    NOT NULL,
  id_cliente INTEGER NOT NULL REFERENCES clientes(id)
);
CREATE TABLE lineas_pedido (
  id_pedido   INTEGER NOT NULL REFERENCES pedidos(id),
  id_producto INTEGER NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL,
  PRIMARY KEY (id_pedido, id_producto)
);
SELECT name AS tabla FROM sqlite_master WHERE type = 'table' ORDER BY name;
```

Resultado:

| tabla |
|---|
| categorias |
| clientes |
| lineas_pedido |
| pedidos |
| productos |

*5 filas*

Mira cómo se ha aplicado cada regla:

* Cada **entidad** tiene su tabla con su `id` como clave primaria.
* `productos.id_categoria` es la clave foránea de la relación **1:N** entre categorías y productos (el «muchos» son los productos).
* `pedidos.id_cliente` es la de la relación **1:N** entre clientes y pedidos.
* `lineas_pedido` es la **tabla intermedia** de la relación **N:M** entre pedidos y productos. Tiene dos claves foráneas y el atributo propio de la relación (`cantidad`). Su clave primaria es **la pareja** `(id_pedido, id_producto)`: así, un mismo producto no puede aparecer dos veces en el mismo pedido (se sumaría la cantidad).

## Qué impiden las claves foráneas

Las claves foráneas **protegen la coherencia**: no se puede apuntar a algo que no existe. Aquí se intenta registrar una línea de un producto inexistente:

```sql
CREATE TABLE categorias (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE productos (
  id           INTEGER PRIMARY KEY,
  nombre       TEXT    NOT NULL,
  precio       REAL    NOT NULL,
  id_categoria INTEGER NOT NULL REFERENCES categorias(id)
);
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  fecha      TEXT    NOT NULL,
  id_cliente INTEGER NOT NULL REFERENCES clientes(id)
);
CREATE TABLE lineas_pedido (
  id_pedido   INTEGER NOT NULL REFERENCES pedidos(id),
  id_producto INTEGER NOT NULL REFERENCES productos(id),
  cantidad    INTEGER NOT NULL,
  PRIMARY KEY (id_pedido, id_producto)
);
INSERT INTO lineas_pedido VALUES (1, 99, 2);
```

Resultado: **error**

```text
IntegrityError: FOREIGN KEY constraint failed
```

(El mensaje exacto cambia según el motor, pero todos rechazan la operación.)

## Claves: naturales y artificiales

La clave primaria puede ser un dato **natural** del mundo real (el DNI, el ISBN) o un número **artificial** (`id`) que el sistema genera.

| | Natural | Artificial (`id` autonumérico) |
|---|---|---|
| Ventaja | Tiene significado | **Nunca cambia** y es corta |
| Inconveniente | Puede cambiar o repetirse, o ser larga | No significa nada para el usuario |

Lo habitual es usar un `id` artificial como clave primaria y marcar el dato natural (el correo, el DNI) como **`UNIQUE`**, como se ha hecho con `clientes.email`.

## Un 1:1 y un multivaluado

**Relación 1:1.** Un cliente puede tener, como mucho, un perfil con sus preferencias. La clave foránea lleva `UNIQUE`, para que dos perfiles no apunten al mismo cliente:

```sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);
CREATE TABLE perfiles (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL UNIQUE REFERENCES clientes(id),
  idioma     TEXT NOT NULL DEFAULT 'es'
);
SELECT name AS tabla FROM sqlite_master WHERE type = 'table' ORDER BY name;
```

Resultado:

| tabla |
|---|
| clientes |
| perfiles |

*2 filas*

**Atributo multivaluado.** Un cliente puede tener **varios teléfonos**. En lugar de una columna `telefonos` con una lista (¡nunca!), se crea una tabla aparte con una clave foránea:

```sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);
CREATE TABLE telefonos (
  id         INTEGER PRIMARY KEY,
  id_cliente INTEGER NOT NULL REFERENCES clientes(id),
  telefono   TEXT NOT NULL
);
INSERT INTO clientes VALUES (1, 'Ana');
INSERT INTO telefonos (id_cliente, telefono) VALUES (1, '600111222'), (1, '956333444');
SELECT c.nombre, t.telefono FROM clientes c JOIN telefonos t ON t.id_cliente = c.id;
```

Resultado:

| nombre | telefono |
|---|---|
| Ana | 600111222 |
| Ana | 956333444 |

*2 filas*

(Los `JOIN` se explican en la [unidad 4](../u04/index.md); aquí solo sirven para ver los dos teléfonos de Ana.)

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Poner la clave foránea en el lado «1» de un 1:N | Va **donde está el «muchos»** |
| Resolver un N:M con una columna que guarda varios valores (`"3,5,8"`) | Una tabla intermedia |
| Una tabla intermedia sin clave primaria compuesta | La pareja de claves foráneas es la clave primaria |
| Olvidar `UNIQUE` en una relación 1:1 | Sin él, es en realidad un 1:N |
| Guardar un dato que ya está en otra tabla | Guarda solo la clave y consulta el dato (ver la normalización) |

## Para practicar

Los ejercicios S2.1 a S2.4 de [S2 · Ejercicios](ejercicios.md) piden escribir las tablas de un enunciado.
