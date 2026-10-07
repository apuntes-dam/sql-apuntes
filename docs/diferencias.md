# Diferencias entre motores

SQL es un **estándar**, pero cada motor lo implementa a su manera y añade extensiones. El SQL **básico** (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `INSERT`, `UPDATE`, `DELETE`) funciona casi igual en todos. Lo que cambia son los **detalles**, y es lo que más tropiezos causa al pasar de un motor a otro.

!!! warning "Qué está comprobado y qué no"
    En esta web **solo se ha ejecutado SQLite**. La columna de SQLite de las tablas de abajo se ha comprobado en este equipo; las de **MySQL**, **PostgreSQL** y **Oracle** proceden de la documentación de cada motor y pueden variar entre versiones. Ante la duda, consulta el manual del motor que uses.

## Lo más habitual

| Quiero... | SQLite | MySQL | PostgreSQL | Oracle |
|---|---|---|---|---|
| Limitar filas | `LIMIT 3` | `LIMIT 3` | `LIMIT 3` | `FETCH FIRST 3 ROWS ONLY` |
| Concatenar texto | `a \|\| b` | `CONCAT(a, b)` | `a \|\| b` | `a \|\| b` |
| Clave autonumérica | `INTEGER PRIMARY KEY AUTOINCREMENT` | `INT AUTO_INCREMENT` | `GENERATED ... AS IDENTITY` / `SERIAL` | `GENERATED ... AS IDENTITY` |
| Fecha de hoy | `date('now')` | `CURDATE()` | `CURRENT_DATE` | `SYSDATE` |
| Año de una fecha | `strftime('%Y', f)` | `YEAR(f)` | `EXTRACT(YEAR FROM f)` | `EXTRACT(YEAR FROM f)` |
| Verdadero/falso | `0` y `1` | `BOOLEAN` (= `TINYINT`) | `BOOLEAN` | `NUMBER(1)` |
| Texto con comillas | `'texto'` | `'texto'` | `'texto'` | `'texto'` |
| Nombre con caracteres especiales | `"nombre"` | `` `nombre` `` | `"nombre"` | `"nombre"` |
| Vaciar una tabla | `DELETE FROM t` | `TRUNCATE TABLE t` | `TRUNCATE TABLE t` | `TRUNCATE TABLE t` |
| Ver las tablas | `.tables` o `sqlite_master` | `SHOW TABLES` | `\dt` o `information_schema` | `SELECT * FROM user_tables` |
| Ver las columnas | `PRAGMA table_info(t)` | `DESCRIBE t` | `\d t` | `DESCRIBE t` |

## Operaciones de conjuntos y uniones

| | SQLite | MySQL | PostgreSQL | Oracle |
|---|---|---|---|---|
| `UNION`, `UNION ALL` | Sí | Sí | Sí | Sí |
| `INTERSECT` | Sí | Desde 8.0.31 | Sí | Sí |
| `EXCEPT` | Sí | Desde 8.0.31 | Sí | Se llama `MINUS` |
| `RIGHT JOIN` | Desde 3.39 | Sí | Sí | Sí |
| `FULL JOIN` | Desde 3.39 | **No** | Sí | Sí |

## Funciones modernas

| | SQLite | MySQL | PostgreSQL | Oracle |
|---|---|---|---|---|
| `WITH` (CTE) | Sí | Desde 8.0 | Sí | Sí |
| Funciones de ventana | Desde 3.25 | Desde 8.0 | Sí | Sí |
| Vistas materializadas | No | No | Sí | Sí |
| Procedimientos almacenados | **No** | Sí | Sí | Sí (PL/SQL) |
| `RETURNING` | Sí | No (usa `LAST_INSERT_ID()`) | Sí | Sí (`RETURNING ... INTO`) |

## Insertar o actualizar («upsert»)

Una operación muy común: **insertar** una fila y, si ya existe, **actualizarla**. Cada motor lo escribe distinto. En SQLite (comprobado) y PostgreSQL:

```sql
INSERT INTO profesores (id, nombre) VALUES (1, 'Marta Ruiz Pérez')
ON CONFLICT (id) DO UPDATE SET nombre = excluded.nombre;
```

| Motor | Escritura |
|---|---|
| SQLite y PostgreSQL | `INSERT ... ON CONFLICT (columna) DO UPDATE SET ...` |
| MySQL | `INSERT ... ON DUPLICATE KEY UPDATE ...` |
| Oracle | `MERGE INTO ... USING ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...` |

## Cómo se comportan distinto

| Aspecto | Qué cambia |
|---|---|
| **Tipos** | SQLite no los comprueba estrictamente; los demás sí |
| **Mayúsculas en `LIKE`** | En SQLite y MySQL no distingue; en PostgreSQL sí (`ILIKE` para ignorarlas) |
| **Ordenar los `NULL`** | SQLite y MySQL los ponen primero en orden ascendente; PostgreSQL y Oracle, los últimos |
| **División de enteros** | `7 / 2` da `3` en SQLite y PostgreSQL, pero `3.5` en MySQL |
| **División entre 0** | `NULL` en SQLite y MySQL; **error** en PostgreSQL y Oracle |
| **Columna sin agrupar en `GROUP BY`** | SQLite la acepta (valor cualquiera); los demás la rechazan |
| **Claves foráneas** | SQLite las ignora salvo `PRAGMA foreign_keys = ON`; los demás las comprueban siempre |
| **Transacciones** | La mayoría empieza en *autocommit*; en Oracle una transacción empieza con la primera sentencia y hay que confirmar con `COMMIT` |

## Cómo escribir SQL que cambie lo menos posible

* Usa el **SQL estándar** siempre que puedas (`JOIN ... ON`, `CASE`, `COALESCE`, `CAST`).
* Aísla lo **específico de un motor** (fechas, paginación, autonumerados) en un solo sitio.
* Prueba el SQL **en el motor real** donde se va a usar.
* Los programas (Java, Python...) usan **capas de acceso a datos** (DAO, ORM como Hibernate o SQLAlchemy) que ocultan buena parte de estas diferencias, como se ve en la unidad de bases de datos de los [lenguajes](https://apuntes-dam.github.io/apuntes-lenguajes/).
