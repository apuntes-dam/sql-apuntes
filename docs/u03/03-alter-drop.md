# 3.3 ALTER, DROP e integridad referencial

## ALTER TABLE: cambiar la estructura

`ALTER TABLE` modifica una tabla **que ya existe y tiene datos**.

**Añadir una columna:**

```sql
ALTER TABLE alumnos ADD COLUMN email TEXT;
UPDATE alumnos SET email = LOWER(nombre) || '@instituto.es' WHERE id <= 3;
SELECT id, nombre, email FROM alumnos WHERE id <= 4;
```

Resultado:

| id | nombre | email |
|---|---|---|
| 1 | Ana | ana@instituto.es |
| 2 | Luis | luis@instituto.es |
| 3 | Marta | marta@instituto.es |
| 4 | Pablo | NULL |

*4 filas*

Las filas que ya existían reciben `NULL` en la columna nueva (o su `DEFAULT`). Por eso una columna nueva **`NOT NULL` necesita un valor por defecto**.

**Renombrar una columna o una tabla:**

```sql
ALTER TABLE profesores RENAME COLUMN nombre TO nombre_completo;
SELECT * FROM profesores;
```

Resultado:

| id | nombre_completo |
|---|---|
| 1 | Marta Ruiz |
| 2 | Pedro Salas |
| 3 | Lucía Ferrer |
| 4 | Hugo Navas |

*4 filas*

**Borrar una columna:**

```sql
ALTER TABLE alumnos DROP COLUMN ciudad;
SELECT * FROM alumnos LIMIT 3;
```

Resultado:

| id | nombre | apellido | nacimiento | id_grupo |
|---|---|---|---|---|
| 1 | Ana | Gil | 2005-03-14 | 1 |
| 2 | Luis | Romero | 2004-11-02 | 1 |
| 3 | Marta | Díaz | 2005-07-21 | 1 |

*3 filas*

Borrar una columna **elimina sus datos para siempre**.

| Operación | SQLite | MySQL | PostgreSQL |
|---|---|---|---|
| Añadir columna | `ADD COLUMN` | `ADD COLUMN` | `ADD COLUMN` |
| Cambiar el tipo | **No se puede** (hay que recrear la tabla) | `MODIFY COLUMN` | `ALTER COLUMN ... TYPE` |
| Añadir una restricción después | **No se puede** (hay que recrear la tabla) | `ADD CONSTRAINT` | `ADD CONSTRAINT` |

!!! info "SQLite y los cambios de estructura"
    SQLite permite pocos cambios con `ALTER TABLE`. Para el resto se **crea una tabla nueva**, se copian los datos con `INSERT ... SELECT`, se borra la antigua y se renombra la nueva. Es un truco habitual cuando se trabaja con SQLite.

## DROP TABLE: borrar una tabla

`DROP TABLE` elimina la tabla **con todos sus datos**, sin pedir confirmación:

```sql
CREATE TABLE temporal (id INTEGER PRIMARY KEY);
DROP TABLE temporal;
SELECT name AS tabla FROM sqlite_master WHERE type = 'table' ORDER BY name;
```

Resultado:

| tabla |
|---|
| alumnos |
| asignaturas |
| grupos |
| notas |
| profesores |

*5 filas*

`DROP TABLE IF EXISTS nombre;` no da error si la tabla no existe. Si otras tablas **dependen** de ella por una clave foránea, el motor lo impide:

```sql
DROP TABLE grupos;
```

Resultado: **error**

```text
IntegrityError: FOREIGN KEY constraint failed
```

## Integridad referencial: qué pasa al borrar o cambiar un «padre»

Al declarar una clave foránea se puede decidir **qué ocurre con las filas hijas** cuando se borra (`ON DELETE`) o se cambia (`ON UPDATE`) la fila padre:

| Opción | Qué hace |
|---|---|
| `RESTRICT` / `NO ACTION` | **Impide** borrar el padre mientras tenga hijos (es lo habitual por defecto) |
| `CASCADE` | **Borra también** las filas hijas |
| `SET NULL` | Pone **`NULL`** en la clave foránea de los hijos |
| `SET DEFAULT` | Pone el valor por defecto |

Se ve claramente con un ejemplo: dos tipos de hijos, uno con `CASCADE` (los comentarios de una entrada no tienen sentido sin ella) y otro con `SET NULL` (los autores sobreviven):

```sql
CREATE TABLE entradas (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL);
CREATE TABLE comentarios (
  id         INTEGER PRIMARY KEY,
  id_entrada INTEGER NOT NULL REFERENCES entradas(id) ON DELETE CASCADE,
  texto      TEXT NOT NULL
);
CREATE TABLE descargas (
  id         INTEGER PRIMARY KEY,
  id_entrada INTEGER REFERENCES entradas(id) ON DELETE SET NULL,
  usuario    TEXT NOT NULL
);
INSERT INTO entradas VALUES (1, 'Hola mundo');
INSERT INTO comentarios VALUES (1, 1, 'Bien'), (2, 1, 'Genial');
INSERT INTO descargas VALUES (1, 1, 'ana');
DELETE FROM entradas WHERE id = 1;
SELECT (SELECT COUNT(*) FROM comentarios) AS comentarios, (SELECT COUNT(*) FROM descargas) AS descargas, (SELECT id_entrada FROM descargas) AS entrada_de_la_descarga;
```

Resultado:

| comentarios | descargas | entrada_de_la_descarga |
|---|---|---|
| 0 | 1 | NULL |

*1 fila*

Al borrar la entrada, **se han borrado sus 2 comentarios** (`CASCADE`) y **la descarga ha quedado** con la entrada a `NULL` (`SET NULL`).

!!! warning "SQLite necesita activar las claves foráneas"
    En SQLite las claves foráneas **no se comprueban** hasta ejecutar `PRAGMA foreign_keys = ON;` en cada conexión. Todos los ejemplos de esta web lo tienen activado. MySQL (con InnoDB), PostgreSQL y Oracle las comprueban siempre.

!!! danger "CASCADE con cuidado"
    Un borrado en cascada puede **eliminar muchísimos datos de golpe** sin avisar. Úsalo solo cuando los hijos no tienen sentido sin el padre.

## CREATE TABLE ... AS SELECT: copiar el resultado de una consulta

Crea una tabla nueva con el resultado de un `SELECT`: útil para copias, informes o pruebas:

```sql
CREATE TABLE aprobados_1 AS
SELECT id_alumno, id_asignatura, nota FROM notas WHERE convocatoria = 1 AND nota >= 5;
SELECT COUNT(*) AS filas FROM aprobados_1;
```

Resultado:

| filas |
|---|
| 35 |

*1 fila*

La tabla copia las columnas y los datos, pero **no las restricciones** (ni claves ni `NOT NULL`).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| `DROP TABLE` en el sitio equivocado | Comprueba la base de datos a la que estás conectado |
| Añadir una columna `NOT NULL` sin `DEFAULT` a una tabla con datos | Dar un valor por defecto |
| Usar `CASCADE` «por si acaso» | Decidir fila por fila qué debe pasar con los hijos |
| Esperar que `ALTER TABLE` lo haga todo en SQLite | Recrear la tabla para los cambios grandes |
| Cambiar la estructura sin copia de seguridad | Copia antes de `ALTER` y `DROP` |

## Para practicar

Los ejercicios S3.8 a S3.12 de [S3 · Ejercicios](ejercicios.md) combinan estas sentencias.
