# 1.1 Bases de datos y SQL

## Qué es una base de datos

Una **base de datos** es un conjunto de información **organizada** para poder guardarla, buscarla y modificarla de forma rápida y segura. El programa que la gestiona se llama **sistema gestor de bases de datos** (SGBD): MySQL, PostgreSQL, Oracle, SQL Server o SQLite son ejemplos.

Podrías guardar los datos de un instituto en una hoja de cálculo, pero enseguida aparecen problemas: datos **repetidos** (el nombre de un grupo escrito cien veces, con erratas), imposibilidad de que **varias personas** modifiquen a la vez sin pisarse, y ninguna garantía de que los datos tengan sentido (una nota de 25, un alumno en un grupo que no existe). Una base de datos **relacional** resuelve esto.

## El modelo relacional

En una base de datos relacional la información se guarda en **tablas**, y las tablas se **relacionan** entre sí.

| Concepto | Qué es | Ejemplo |
|---|---|---|
| **Tabla** | Un conjunto de datos del mismo tipo | `alumnos` |
| **Fila** (registro, tupla) | Un elemento concreto | el alumno «Ana Gil» |
| **Columna** (campo, atributo) | Un dato de cada fila, con un **tipo** | `nombre`, `ciudad`, `nacimiento` |
| **Clave primaria** | La columna (o columnas) que **identifica cada fila** de forma única | `alumnos.id` |
| **Clave foránea** | Una columna que **apunta a la clave primaria de otra tabla** y las relaciona | `alumnos.id_grupo` → `grupos.id` |
| **NULL** | La ausencia de valor («no se sabe» o «no tiene») | un alumno sin grupo |

Gracias a las claves foráneas, el nombre de un grupo se guarda **una sola vez** y los alumnos solo guardan su número. Si el grupo cambia de nombre, se cambia en un único sitio.

!!! note "No es la única forma de guardar datos"
    Existen también las bases de datos **no relacionales** (**NoSQL**), que no usan tablas unidas por claves sino **documentos, pares clave-valor, columnas o grafos**. Son una buena elección para otros problemas (datos que cambian de forma, enormes cantidades de usuarios, redes de relaciones), pero para datos con muchas reglas y relaciones, como los de un instituto, la relacional sigue siendo lo habitual. Verás las diferencias con ejemplos en la [unidad 7](../u07/index.md).

## SQL: un lenguaje declarativo

**SQL** (*Structured Query Language*) no se escribe como un programa paso a paso. Es **declarativo**: describes **qué datos quieres** y el gestor decide **cómo** obtenerlos (ver la diferencia con el enfoque imperativo en la [web de Android](https://apuntes-dam.github.io/android-apuntes/u01/interfaces/)).

Las sentencias se agrupan según lo que hacen:

| Familia | Para qué | Sentencias |
|---|---|---|
| **DQL** (consulta) | Leer datos | `SELECT` |
| **DML** (manipulación) | Cambiar datos | `INSERT`, `UPDATE`, `DELETE` |
| **DDL** (definición) | Crear y cambiar la **estructura** | `CREATE`, `ALTER`, `DROP` |
| **TCL** (transacciones) | Agrupar y confirmar cambios | `BEGIN`, `COMMIT`, `ROLLBACK` |
| **DCL** (control) | Dar o quitar permisos | `GRANT`, `REVOKE` |

## La base de datos de ejemplo: un instituto

Todos los ejemplos y ejercicios de esta web usan la misma base de datos, con **datos ficticios**:

```text
grupos (id, nombre, curso)
   │ 1
   │ N
alumnos (id, nombre, apellido, nacimiento, ciudad, id_grupo) ──┐
   │ 1                                                         │
   │ N                                                         │
notas (id_alumno, id_asignatura, nota, convocatoria)           │
   │ N                                                         │
   │ 1                                                         │
asignaturas (id, nombre, horas, id_profesor)                   │
   │ N                                                         │
   │ 1                                                         │
profesores (id, nombre)                                        │
```

* Un **grupo** tiene muchos **alumnos**.
* Un **alumno** tiene muchas **notas** (una por asignatura y convocatoria), y una **asignatura** aparece en muchas notas: entre alumnos y asignaturas hay una relación de **muchos a muchos**, que se resuelve con la tabla `notas`.
* Una **asignatura** la imparte un **profesor** (o ninguno todavía).
* Hay un alumno **sin grupo** y una asignatura **sin profesor**, a propósito, para practicar con `NULL`.

Estas son las tablas pequeñas completas:

```sql
SELECT * FROM grupos;
```

Resultado:

| id | nombre | curso |
|---|---|---|
| 1 | 1DAM-A | 1 |
| 2 | 1DAM-B | 1 |
| 3 | 2DAM-A | 2 |

*3 filas*

```sql
SELECT * FROM asignaturas;
```

Resultado:

| id | nombre | horas | id_profesor |
|---|---|---|---|
| 1 | Programación | 230 | 1 |
| 2 | Bases de Datos | 160 | 2 |
| 3 | Entornos de Desarrollo | 100 | 3 |
| 4 | Lenguajes de Marcas | 100 | 3 |
| 5 | Sistemas Informáticos | 160 | 4 |
| 6 | Inglés Técnico | 60 | NULL |

*6 filas*

Y esta es la tabla de alumnos (los 10 primeros de 14):

```sql
SELECT * FROM alumnos;
```

Resultado:

| id | nombre | apellido | nacimiento | ciudad | id_grupo |
|---|---|---|---|---|---|
| 1 | Ana | Gil | 2005-03-14 | Cádiz | 1 |
| 2 | Luis | Romero | 2004-11-02 | Sevilla | 1 |
| 3 | Marta | Díaz | 2005-07-21 | Cádiz | 1 |
| 4 | Pablo | Núñez | 2003-01-30 | Jerez | 2 |
| 5 | Sara | Vega | 2005-09-09 | Sevilla | 2 |
| 6 | Iván | Torres | 2004-05-17 | Cádiz | 2 |
| 7 | Elena | Marín | 2002-12-05 | Málaga | 3 |
| 8 | Raúl | Campos | 2003-06-25 | Cádiz | 3 |
| 9 | Noa | Prieto | 2004-02-11 | Jerez | 3 |
| 10 | Dani | Soto | 2005-04-01 | Sevilla | 1 |
| … | … | … | … | … | … |

*14 filas* (se muestran 10)

## Cómo practicar

Necesitas **un sitio donde escribir SQL y ejecutarlo**. Cualquiera de estos sirve:

| Opción | Cuándo |
|---|---|
| **SQLite** (programa `sqlite3` o un visor como *DB Browser for SQLite*) | La más sencilla: un solo archivo, sin servidor. **Es el motor con el que se han comprobado todos los resultados de esta web** |
| **MySQL** / **MariaDB** con *MySQL Workbench* o *DBeaver* | Si tu módulo usa MySQL |
| **PostgreSQL** con *pgAdmin* o *DBeaver* | Si prefieres PostgreSQL |

Para crear la base de datos en tu herramienta, copia este script y ejecútalo entero **una vez**:

??? note "Script para crear y rellenar la base de datos del instituto"
    ```sql
    CREATE TABLE grupos (
      id     INTEGER PRIMARY KEY,
      nombre TEXT    NOT NULL,
      curso  INTEGER NOT NULL
    );
    CREATE TABLE profesores (
      id     INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL
    );
    CREATE TABLE asignaturas (
      id          INTEGER PRIMARY KEY,
      nombre      TEXT    NOT NULL,
      horas       INTEGER NOT NULL,
      id_profesor INTEGER REFERENCES profesores(id)
    );
    CREATE TABLE alumnos (
      id         INTEGER PRIMARY KEY,
      nombre     TEXT NOT NULL,
      apellido   TEXT NOT NULL,
      nacimiento TEXT NOT NULL,
      ciudad     TEXT NOT NULL,
      id_grupo   INTEGER REFERENCES grupos(id)
    );
    CREATE TABLE notas (
      id_alumno     INTEGER NOT NULL REFERENCES alumnos(id),
      id_asignatura INTEGER NOT NULL REFERENCES asignaturas(id),
      nota          REAL    NOT NULL,
      convocatoria  INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (id_alumno, id_asignatura, convocatoria)
    );

    INSERT INTO grupos VALUES
      (1, '1DAM-A', 1),
      (2, '1DAM-B', 1),
      (3, '2DAM-A', 2);

    INSERT INTO profesores VALUES
      (1, 'Marta Ruiz'),
      (2, 'Pedro Salas'),
      (3, 'Lucía Ferrer'),
      (4, 'Hugo Navas');

    INSERT INTO asignaturas VALUES
      (1, 'Programación', 230, 1),
      (2, 'Bases de Datos', 160, 2),
      (3, 'Entornos de Desarrollo', 100, 3),
      (4, 'Lenguajes de Marcas', 100, 3),
      (5, 'Sistemas Informáticos', 160, 4),
      (6, 'Inglés Técnico', 60, NULL);

    INSERT INTO alumnos VALUES
      (1, 'Ana', 'Gil', '2005-03-14', 'Cádiz', 1),
      (2, 'Luis', 'Romero', '2004-11-02', 'Sevilla', 1),
      (3, 'Marta', 'Díaz', '2005-07-21', 'Cádiz', 1),
      (4, 'Pablo', 'Núñez', '2003-01-30', 'Jerez', 2),
      (5, 'Sara', 'Vega', '2005-09-09', 'Sevilla', 2),
      (6, 'Iván', 'Torres', '2004-05-17', 'Cádiz', 2),
      (7, 'Elena', 'Marín', '2002-12-05', 'Málaga', 3),
      (8, 'Raúl', 'Campos', '2003-06-25', 'Cádiz', 3),
      (9, 'Noa', 'Prieto', '2004-02-11', 'Jerez', 3),
      (10, 'Dani', 'Soto', '2005-04-01', 'Sevilla', 1),
      (11, 'Lola', 'Ortiz', '2003-08-19', 'Málaga', 2),
      (12, 'Marcos', 'Peña', '2002-10-10', 'Cádiz', 3),
      (13, 'Irene', 'Lara', '2005-12-24', 'Jerez', NULL),
      (14, 'Álex', 'Roca', '2004-03-03', 'Sevilla', 2);

    INSERT INTO notas VALUES
      (1, 1, 3.5, 1),
      (1, 1, 5.5, 2),
      (1, 2, 6.0, 1),
      (1, 3, 9.0, 1),
      (1, 4, 3.0, 1),
      (1, 4, 4.0, 2),
      (2, 1, 7.0, 1),
      (2, 2, 6.5, 1),
      (2, 3, 8.0, 1),
      (2, 4, 6.5, 1),
      (3, 1, 8.0, 1),
      (3, 2, 8.0, 1),
      (3, 3, 8.0, 1),
      (3, 4, 7.0, 1),
      (4, 1, 4.5, 1),
      (4, 1, 7.0, 2),
      (4, 2, 3.5, 1),
      (4, 2, 6.5, 2),
      (4, 3, 6.0, 1),
      (4, 4, 8.5, 1),
      (5, 1, 7.5, 1),
      (5, 2, 7.5, 1),
      (5, 3, 4.0, 1),
      (5, 3, 5.5, 2),
      (5, 4, 9.5, 1),
      (6, 1, 9.5, 1),
      (6, 2, 8.5, 1),
      (6, 3, 10.0, 1),
      (6, 4, 6.0, 1),
      (7, 2, 3.0, 1),
      (7, 2, 4.5, 2),
      (7, 5, 6.5, 1),
      (7, 6, 4.5, 1),
      (7, 6, 6.5, 2),
      (8, 2, 9.0, 1),
      (8, 5, 7.5, 1),
      (8, 6, 6.5, 1),
      (9, 2, 2.5, 1),
      (9, 2, 5.0, 2),
      (9, 5, 5.0, 1),
      (9, 6, 5.5, 1),
      (10, 1, 5.5, 1),
      (10, 2, 7.0, 1),
      (10, 3, 6.0, 1),
      (10, 4, 3.5, 1),
      (10, 4, 5.5, 2),
      (11, 1, 8.0, 1),
      (11, 2, 7.0, 1),
      (11, 3, 6.0, 1),
      (11, 4, 9.0, 1),
      (12, 2, 4.5, 1),
      (12, 2, 6.5, 2),
      (12, 5, 9.5, 1),
      (12, 6, 6.0, 1),
      (14, 1, 6.5, 1),
      (14, 2, 2.5, 1),
      (14, 2, 3.5, 2);
    ```

!!! info "Si tu motor no es SQLite"
    El SQL básico (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`...) es casi idéntico en todos los motores. Donde hay diferencias (funciones de fecha, concatenación de texto, `LIMIT`...) se indica en un recuadro como este, y hay una [tabla de diferencias entre motores](../diferencias.md).

## Escribir SQL: normas básicas

* Cada sentencia termina en **punto y coma** (`;`).
* Las **palabras clave** (`SELECT`, `FROM`...) no distinguen mayúsculas de minúsculas, pero por costumbre se escriben **en mayúsculas** para distinguirlas de los nombres.
* Los **textos** van entre **comillas simples**: `'Cádiz'`. Las comillas dobles se reservan para nombres de tablas o columnas con caracteres especiales.
* Los **comentarios** son `-- hasta el final de la línea` o `/* varias líneas */`.
* Puedes repartir una sentencia en varias líneas: SQL ignora los saltos de línea y los espacios.

```sql
-- Los alumnos de Cádiz
SELECT nombre, apellido
FROM alumnos
WHERE ciudad = 'Cádiz';
```
