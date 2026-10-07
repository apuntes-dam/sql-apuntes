# 3.1 CREATE TABLE

`CREATE TABLE` define **una tabla nueva**: su nombre, sus columnas, el tipo de cada una y las **reglas** que deben cumplir los datos.

```sql
CREATE TABLE nombre_tabla (
  columna1  TIPO  restricciones,
  columna2  TIPO  restricciones,
  ...
  restricciones_de_tabla
);
```

## Un ejemplo con todas las piezas

Se crea una tabla de **clubes** del instituto, con una regla para casi cada columna:

```sql
CREATE TABLE clubes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL UNIQUE,
  cuota       REAL    NOT NULL DEFAULT 0 CHECK (cuota >= 0),
  fundado     TEXT    NOT NULL,
  id_profesor INTEGER REFERENCES profesores(id)
);
SELECT name AS tabla FROM sqlite_master WHERE type = 'table' ORDER BY name;
```

Resultado:

| tabla |
|---|
| alumnos |
| asignaturas |
| clubes |
| grupos |
| notas |
| profesores |
| sqlite_sequence |

*7 filas*

| Columna | Reglas | Significado |
|---|---|---|
| `id` | `PRIMARY KEY AUTOINCREMENT` | Identifica cada club y se numera sola |
| `nombre` | `NOT NULL UNIQUE` | Obligatorio y **no se repite** |
| `cuota` | `NOT NULL DEFAULT 0 CHECK (cuota >= 0)` | Si no se indica vale 0, y **nunca** puede ser negativa |
| `fundado` | `NOT NULL` | Obligatorio |
| `id_profesor` | `REFERENCES profesores(id)` | Clave foránea: debe ser un profesor existente (o `NULL`) |

## Tipos de datos

Cada motor tiene su lista de tipos. Los principales, y cómo se escriben en cada uno:

| Qué guardas | SQLite | MySQL | PostgreSQL | Oracle |
|---|---|---|---|---|
| Entero | `INTEGER` | `INT` | `INTEGER` | `NUMBER(10)` |
| Decimal exacto (dinero) | `NUMERIC` | `DECIMAL(10,2)` | `NUMERIC(10,2)` | `NUMBER(10,2)` |
| Decimal aproximado | `REAL` | `DOUBLE` | `DOUBLE PRECISION` | `BINARY_DOUBLE` |
| Texto | `TEXT` | `VARCHAR(100)` | `VARCHAR(100)` o `TEXT` | `VARCHAR2(100)` |
| Fecha | `TEXT` (`AAAA-MM-DD`) | `DATE` | `DATE` | `DATE` |
| Fecha y hora | `TEXT` | `DATETIME` | `TIMESTAMP` | `TIMESTAMP` |
| Verdadero o falso | `INTEGER` (0 y 1) | `BOOLEAN` (es un `TINYINT`) | `BOOLEAN` | `NUMBER(1)` |

!!! info "SQLite es más flexible que los demás"
    SQLite tiene solo unos pocos tipos y **no obliga** a que un valor coincida con el tipo de su columna (guarda lo que le des). En MySQL, PostgreSQL u Oracle el tipo se comprueba: no puedes meter `'hola'` en una columna `INT`. Conviene escribir los datos como si el motor fuera estricto.

## Las restricciones

| Restricción | Qué impone |
|---|---|
| `PRIMARY KEY` | Identifica cada fila: **única y no nula**. Solo una por tabla (puede ser de varias columnas) |
| `NOT NULL` | La columna **no puede quedar vacía** |
| `UNIQUE` | No puede haber **dos filas con el mismo valor** (admite `NULL`) |
| `DEFAULT valor` | Valor que se usa cuando no se indica ninguno |
| `CHECK (condición)` | El valor debe cumplir una condición |
| `REFERENCES tabla(columna)` | **Clave foránea**: el valor debe existir en la otra tabla |

Cuando se incumple una, el motor **rechaza la operación** y devuelve un error. Estos son los mensajes reales de SQLite para cada caso (en otros motores el texto cambia, pero el comportamiento es el mismo):

**Valor repetido en una columna `UNIQUE`:**

```sql
INSERT INTO clubes (nombre, fundado) VALUES ('Ajedrez', '2020-09-01');
INSERT INTO clubes (nombre, fundado) VALUES ('Ajedrez', '2021-01-10');
```

Resultado: **error**

```text
IntegrityError: UNIQUE constraint failed: clubes.nombre
```

**Falta un valor obligatorio (`NOT NULL`):**

```sql
INSERT INTO clubes (nombre) VALUES ('Teatro');
```

Resultado: **error**

```text
IntegrityError: NOT NULL constraint failed: clubes.fundado
```

**Valor que incumple el `CHECK`:**

```sql
INSERT INTO clubes (nombre, cuota, fundado) VALUES ('Lectura', -5, '2022-03-01');
```

Resultado: **error**

```text
IntegrityError: CHECK constraint failed: cuota >= 0
```

**Clave foránea a una fila que no existe:**

```sql
INSERT INTO clubes (nombre, fundado, id_profesor) VALUES ('Robótica', '2023-02-01', 99);
```

Resultado: **error**

```text
IntegrityError: FOREIGN KEY constraint failed
```

Gracias a estas reglas, **la base de datos se defiende sola** de datos incorrectos, sin depender de que cada programa se acuerde de comprobarlos.

## Claves que se numeran solas

Cómo se escribe «número automático» depende del motor:

| Motor | Escritura |
|---|---|
| SQLite | `id INTEGER PRIMARY KEY AUTOINCREMENT` (o solo `INTEGER PRIMARY KEY`) |
| MySQL | `id INT PRIMARY KEY AUTO_INCREMENT` |
| PostgreSQL | `id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY` (o `SERIAL`) |
| Oracle | `id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY` |

## Restricciones de varias columnas

Las que afectan a **más de una columna** se escriben al final, como restricciones de tabla. Aquí, una clave primaria **compuesta** y un `UNIQUE` sobre el par:

```sql
CREATE TABLE inscripciones (
  id_alumno INTEGER NOT NULL REFERENCES alumnos(id),
  id_club   INTEGER NOT NULL,
  desde     TEXT    NOT NULL,
  PRIMARY KEY (id_alumno, id_club)
);
INSERT INTO inscripciones VALUES (1, 10, '2025-09-15'), (2, 10, '2025-09-16');
SELECT * FROM inscripciones;
```

Resultado:

| id_alumno | id_club | desde |
|---|---|---|
| 1 | 10 | 2025-09-15 |
| 2 | 10 | 2025-09-16 |

*2 filas*

## Crear solo si no existe

`CREATE TABLE IF NOT EXISTS ...` no hace nada (y no da error) si la tabla ya existe: útil en programas que se ejecutan muchas veces y deben dejar la base de datos preparada.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Crear una tabla sin clave primaria | Toda tabla debe tener una |
| Dejar columnas sin `NOT NULL` por pereza | Marca como obligatorio todo lo que lo sea |
| Guardar dinero en `REAL` | `DECIMAL`/`NUMERIC` (o céntimos como entero) |
| Crear la tabla «hija» antes que la «padre» | Primero las tablas a las que se hace referencia |
| Fiarse de que el programa validará todo | Poner las reglas también en la base de datos |

## Para practicar

Los ejercicios S3.1, S3.9 y S3.11 de [S3 · Ejercicios](ejercicios.md) practican `CREATE TABLE`.
