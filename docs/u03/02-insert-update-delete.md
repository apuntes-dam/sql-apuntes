# 3.2 INSERT, UPDATE y DELETE

Estas tres sentencias **modifican los datos**: añaden filas, cambian valores y borran filas.

## INSERT: añadir filas

La forma recomendada **indica las columnas**:

```sql
INSERT INTO alumnos (nombre, apellido, nacimiento, ciudad, id_grupo)
VALUES ('Paula', 'Rey', '2005-05-05', 'Cádiz', 1);
SELECT id, nombre, apellido, id_grupo FROM alumnos WHERE nombre = 'Paula';
```

Resultado:

| id | nombre | apellido | id_grupo |
|---|---|---|---|
| 15 | Paula | Rey | 1 |

*1 fila*

Observa que **no se ha escrito el `id`**: se ha numerado solo. Las columnas que no se mencionan reciben su valor `DEFAULT`, o `NULL` si no lo tienen.

!!! warning "Indica siempre las columnas"
    `INSERT INTO alumnos VALUES (...)` sin lista de columnas obliga a escribir **todas, en el orden exacto de la tabla**. Si alguien añade una columna, el `INSERT` se rompe. Con la lista de columnas, no.

Se pueden insertar **varias filas** en una sola sentencia:

```sql
INSERT INTO asignaturas (nombre, horas, id_profesor) VALUES
  ('Robótica', 60, NULL),
  ('Diseño de Interfaces', 100, 3);
SELECT * FROM asignaturas WHERE id > 6;
```

Resultado:

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 7 | Robótica | 60 | NULL |
| 8 | Diseño de Interfaces | 100 | 3 |

*2 filas*

Y se pueden insertar **el resultado de una consulta** con `INSERT ... SELECT`, por ejemplo para copiar filas:

```sql
INSERT INTO asignaturas (nombre, horas, id_profesor)
SELECT nombre || ' II', horas, id_profesor FROM asignaturas WHERE id = 1;
SELECT * FROM asignaturas WHERE id > 6;
```

Resultado:

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 7 | Programación II | 230 | 1 |

*1 fila*

### Conocer el `id` que se acaba de crear

Es muy habitual necesitar el número que la base de datos le ha dado a la fila nueva (para insertar después filas relacionadas). Cada motor lo hace a su manera; SQLite, PostgreSQL y otros admiten **`RETURNING`**:

```sql
INSERT INTO grupos (nombre, curso) VALUES ('1DAM-C', 1) RETURNING id;
```

Resultado:

| id |
|---|
| 4 |

*1 fila*

| Motor | Cómo obtener el último `id` |
|---|---|
| SQLite | `RETURNING id` o `last_insert_rowid()` |
| PostgreSQL | `RETURNING id` |
| MySQL | `LAST_INSERT_ID()` |
| Oracle | `RETURNING id INTO ...` |

## UPDATE: cambiar valores

```sql
UPDATE tabla SET columna = valor, otra = valor WHERE condición;
```

```sql
UPDATE alumnos SET id_grupo = 3 WHERE nombre = 'Irene';
SELECT nombre, apellido, id_grupo FROM alumnos WHERE nombre = 'Irene';
```

Resultado:

| nombre | apellido | id_grupo |
|---|---|---|
| Irene | Lara | 3 |

*1 fila*

Se pueden cambiar **varias columnas** a la vez y usar **cálculos** con el valor actual. Aquí, la segunda convocatoria de la asignatura 1 sube medio punto, sin pasarse de 10:

```sql
UPDATE notas SET nota = MIN(nota + 0.5, 10) WHERE id_asignatura = 1 AND convocatoria = 2;
SELECT id_alumno, nota FROM notas WHERE id_asignatura = 1 AND convocatoria = 2;
```

Resultado:

| id_alumno | nota |
|---|---|
| 1 | 6.0 |
| 4 | 7.5 |

*2 filas*

## DELETE: borrar filas

```sql
DELETE FROM tabla WHERE condición;
```

```sql
DELETE FROM notas WHERE convocatoria = 2 AND nota < 5;
SELECT COUNT(*) AS notas_restantes FROM notas;
```

Resultado:

| notas_restantes |
|---|
| 54 |

*1 fila*

Todas devuelven cuántas filas han cambiado. Si es **0**, el `WHERE` no encontró nada.

## ⚠ El peligro de olvidar el WHERE

Sin `WHERE`, `UPDATE` y `DELETE` afectan a **todas las filas de la tabla**:

```sql
UPDATE notas SET nota = 0;
```

Resultado:

*57 filas afectadas*

Una sola línea ha puesto a cero **las 57 notas**. En una base de datos real, esto puede ser un desastre. Buenos hábitos:

* **Escribe primero el `WHERE`**, o cambia temporalmente el `UPDATE`/`DELETE` por un `SELECT` con la misma condición y comprueba **qué filas** serían afectadas.
* Haz los cambios importantes **dentro de una transacción**, para poder deshacerlos con `ROLLBACK` (se explica en la [unidad 6](../u06/index.md)).
* Haz una **copia de seguridad** antes de operaciones grandes.

!!! info "Vaciar una tabla"
    `DELETE FROM tabla;` borra todas las filas una a una. MySQL, PostgreSQL y Oracle tienen además `TRUNCATE TABLE tabla;`, mucho más rápido, que vacía la tabla de golpe y **no se puede deshacer** en algunos motores. SQLite no tiene `TRUNCATE`.

## Las claves foráneas también protegen al borrar

No se puede borrar una fila de la que **dependen otras**. El grupo 1 tiene alumnos, así que no se puede eliminar:

```sql
DELETE FROM grupos WHERE id = 1;
```

Resultado: **error**

```text
IntegrityError: FOREIGN KEY constraint failed
```

Hay que **borrar primero lo que depende** (o reasignarlo), o usar un borrado en cascada (se explica en el siguiente apartado).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| `UPDATE` o `DELETE` sin `WHERE` | Escribir el `WHERE` primero y probarlo con un `SELECT` |
| `INSERT` sin lista de columnas | Indicarlas siempre |
| Insertar texto sin comillas, o con comillas dobles | Texto entre **comillas simples** |
| Un apóstrofo dentro de un texto (`O'Brien`) | Se duplica: `'O''Brien'` (y, desde un programa, se usan parámetros) |
| Borrar un «padre» con «hijos» | Borrar antes los hijos, o definir el borrado en cascada |

## Para practicar

Los ejercicios S3.2 a S3.8 de [S3 · Ejercicios](ejercicios.md) practican `INSERT`, `UPDATE` y `DELETE`.
