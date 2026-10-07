# Chuleta de SQL

Las sentencias más usadas, con la base de datos del instituto. Todo el SQL de esta página se ha ejecutado sobre SQLite.

## Consultar

```sql
SELECT DISTINCT ciudad FROM alumnos;                              -- sin repetidos
SELECT nombre, apellido FROM alumnos WHERE ciudad = 'Cádiz';  -- filtrar
SELECT nombre FROM alumnos WHERE id_grupo IS NULL;            -- NULL
SELECT * FROM asignaturas WHERE horas BETWEEN 100 AND 160;    -- rango
SELECT nombre FROM alumnos WHERE ciudad IN ('Jerez', 'Málaga');
SELECT nombre FROM alumnos WHERE apellido LIKE 'R%';          -- patrón
SELECT nombre FROM alumnos ORDER BY apellido DESC LIMIT 3 OFFSET 1;
```

| Cláusula | Para qué | Orden al escribirla |
|---|---|---|
| `SELECT` | Qué columnas | 1 |
| `FROM` / `JOIN` | De dónde | 2 |
| `WHERE` | Filtrar **filas** | 3 |
| `GROUP BY` | Agrupar | 4 |
| `HAVING` | Filtrar **grupos** | 5 |
| `ORDER BY` | Ordenar | 6 |
| `LIMIT` / `OFFSET` | Cuántas filas | 7 |

## Operadores

| Tipo | Operadores |
|---|---|
| Comparación | `=`, `<>` (o `!=`), `<`, `<=`, `>`, `>=` |
| Lógicos | `AND`, `OR`, `NOT` (usa paréntesis al mezclar) |
| Rango y lista | `BETWEEN a AND b`, `IN (...)`, `NOT IN (...)` |
| Texto | `LIKE` con `%` (varios caracteres) y `_` (uno), `\|\|` para concatenar |
| Nulos | `IS NULL`, `IS NOT NULL` (**nunca** `= NULL`) |

## Unir tablas

```sql
SELECT a.nombre, g.nombre FROM alumnos a JOIN grupos g ON g.id = a.id_grupo;        -- INNER
SELECT a.nombre, g.nombre FROM alumnos a LEFT JOIN grupos g ON g.id = a.id_grupo;   -- todos los alumnos
SELECT a.nombre FROM alumnos a LEFT JOIN notas n ON n.id_alumno = a.id WHERE n.id_alumno IS NULL;  -- sin pareja
SELECT ciudad FROM alumnos WHERE id_grupo = 1 UNION SELECT ciudad FROM alumnos WHERE id_grupo = 3;
SELECT ciudad FROM alumnos WHERE id_grupo = 1 INTERSECT SELECT ciudad FROM alumnos WHERE id_grupo = 3;
SELECT id_alumno FROM notas EXCEPT SELECT id_alumno FROM notas WHERE nota < 5;
```

## Agrupar y resumir

```sql
SELECT COUNT(*), COUNT(id_grupo), COUNT(DISTINCT ciudad) FROM alumnos;
SELECT ciudad, COUNT(*) AS n FROM alumnos GROUP BY ciudad HAVING COUNT(*) >= 3 ORDER BY n DESC;
SELECT id_asignatura, ROUND(AVG(nota), 2), MIN(nota), MAX(nota), SUM(nota) FROM notas GROUP BY id_asignatura;
```

## Subconsultas, CASE y NULL

```sql
SELECT nota FROM notas WHERE nota > (SELECT AVG(nota) FROM notas);
SELECT nombre FROM alumnos WHERE id IN (SELECT id_alumno FROM notas WHERE nota < 5);
SELECT nombre FROM alumnos a WHERE NOT EXISTS (SELECT 1 FROM notas n WHERE n.id_alumno = a.id);
SELECT nota, CASE WHEN nota >= 5 THEN 'Aprobado' ELSE 'Suspenso' END FROM notas;
SELECT COALESCE(id_profesor, 0) FROM asignaturas;
```

## Crear, modificar y borrar datos

```sql
INSERT INTO grupos (nombre, curso) VALUES ('1DAM-C', 1);
INSERT INTO grupos (nombre, curso) VALUES ('2DAM-B', 2), ('2DAM-C', 2);
UPDATE alumnos SET ciudad = 'Cádiz' WHERE id = 2;
DELETE FROM notas WHERE convocatoria = 2 AND nota < 5;
```

!!! danger "Sin `WHERE`, `UPDATE` y `DELETE` afectan a TODAS las filas"

## Estructura

```sql
CREATE TABLE clubes (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  cuota  REAL NOT NULL DEFAULT 0 CHECK (cuota >= 0),
  id_profesor INTEGER REFERENCES profesores(id) ON DELETE SET NULL
);
ALTER TABLE clubes ADD COLUMN sala TEXT;
ALTER TABLE clubes RENAME COLUMN sala TO aula;
CREATE INDEX idx_clubes_nombre ON clubes (nombre);
CREATE VIEW clubes_gratis AS SELECT nombre FROM clubes WHERE cuota = 0;
DROP VIEW clubes_gratis;
DROP INDEX idx_clubes_nombre;
DROP TABLE clubes;
```

| Restricción | Qué impone |
|---|---|
| `PRIMARY KEY` | Identifica la fila (única y no nula) |
| `NOT NULL` | No puede quedar vacía |
| `UNIQUE` | No se repite |
| `DEFAULT x` | Valor por defecto |
| `CHECK (cond)` | Debe cumplir la condición |
| `REFERENCES t(c)` | Clave foránea |
| `ON DELETE CASCADE` / `SET NULL` / `RESTRICT` | Qué pasa con los hijos al borrar el padre |

## Transacciones

```sql
BEGIN;
UPDATE notas SET nota = nota + 1 WHERE id_alumno = 1 AND nota < 9;
ROLLBACK;     -- o COMMIT; para confirmar
```

## Consultas avanzadas

```sql
WITH medias AS (SELECT id_alumno, AVG(nota) AS media FROM notas GROUP BY id_alumno)
SELECT * FROM medias WHERE media > 6;

SELECT id_alumno, nota,
       RANK()       OVER (ORDER BY nota DESC)                   AS posicion,
       ROW_NUMBER() OVER (PARTITION BY id_asignatura ORDER BY nota DESC) AS pos_en_asignatura,
       AVG(nota)    OVER (PARTITION BY id_asignatura)           AS media_asignatura
FROM notas;
```

## Funciones útiles (SQLite)

| Tipo | Funciones |
|---|---|
| Texto | `UPPER`, `LOWER`, `LENGTH`, `SUBSTR(t, inicio, n)`, `TRIM`, `REPLACE` |
| Números | `ROUND(x, d)`, `ABS`, `MIN`/`MAX` (con varios valores) |
| Fechas | `date('now')`, `strftime('%Y', f)`, `date(f, '+7 days')` |
| Nulos | `COALESCE`, `IFNULL`, `NULLIF` |
| Conversión | `CAST(x AS INTEGER)` |
