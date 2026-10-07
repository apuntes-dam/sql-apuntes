# 6.1 CASE y el tratamiento de NULL

## CASE: decidir dentro de una consulta

`CASE` es el «si... entonces... si no...» de SQL: devuelve **un valor u otro según una condición**.

```sql
CASE
  WHEN condición1 THEN valor1
  WHEN condición2 THEN valor2
  ELSE valor_por_defecto
END
```

Las condiciones se evalúan **de arriba abajo** y gana la **primera** que se cumple. Por ejemplo, convertir las notas en calificaciones con letra:

```sql
SELECT id_alumno, id_asignatura, nota,
  CASE
    WHEN nota >= 9 THEN 'Sobresaliente'
    WHEN nota >= 7 THEN 'Notable'
    WHEN nota >= 5 THEN 'Aprobado'
    ELSE 'Suspenso'
  END AS calificacion
FROM notas
WHERE convocatoria = 1
ORDER BY nota DESC;
```

Resultado:

| id_alumno | id_asignatura | nota | calificacion |
|---|---|---|---|
| 6 | 3 | 10.0 | Sobresaliente |
| 5 | 4 | 9.5 | Sobresaliente |
| 6 | 1 | 9.5 | Sobresaliente |
| 12 | 5 | 9.5 | Sobresaliente |
| 1 | 3 | 9.0 | Sobresaliente |
| 8 | 2 | 9.0 | Sobresaliente |
| … | … | … | … |

*46 filas* (se muestran 6)

(Es el mismo razonamiento que un `if / else if / else` de un lenguaje de programación: el orden importa.)

## Contar con condiciones

La combinación más útil: **un `CASE` dentro de un agregado** para contar o sumar solo lo que cumple algo, y así obtener **varias cifras en una sola consulta**. Aprobados y suspensos de cada asignatura:

```sql
SELECT s.nombre AS asignatura,
       SUM(CASE WHEN n.nota >= 5 THEN 1 ELSE 0 END) AS aprobados,
       SUM(CASE WHEN n.nota <  5 THEN 1 ELSE 0 END) AS suspensos
FROM notas n
JOIN asignaturas s ON s.id = n.id_asignatura
WHERE n.convocatoria = 1
GROUP BY s.id, s.nombre
ORDER BY s.nombre;
```

Resultado:

| asignatura | aprobados | suspensos |
|---|---|---|
| Bases de Datos | 8 | 5 |
| Entornos de Desarrollo | 7 | 1 |
| Inglés Técnico | 3 | 1 |
| Lenguajes de Marcas | 6 | 2 |
| Programación | 7 | 2 |
| Sistemas Informáticos | 4 | 0 |

*6 filas*

Cada nota aporta un 1 a una de las dos columnas y un 0 a la otra; al sumar por asignatura salen los totales.

## Manejar los NULL

Un `NULL` en un cálculo **contagia**: `5 + NULL` es `NULL`, y concatenar un texto con `NULL` da `NULL`. Tres funciones lo controlan:

| Función | Qué hace | Ejemplo |
|---|---|---|
| `COALESCE(a, b, ...)` | Devuelve **el primer valor que no sea `NULL`** | `COALESCE(profesor, 'Sin asignar')` |
| `IFNULL(a, b)` | Lo mismo con dos valores (en MySQL y SQLite) | `IFNULL(id_grupo, 0)` |
| `NULLIF(a, b)` | Devuelve `NULL` **si `a` es igual a `b`** (útil para evitar dividir entre 0) | `x / NULLIF(y, 0)` |

Mostrar «Sin asignar» donde no hay profesor:

```sql
SELECT s.nombre AS asignatura, COALESCE(p.nombre, 'Sin asignar') AS profesor
FROM asignaturas s
LEFT JOIN profesores p ON p.id = s.id_profesor;
```

Resultado:

| asignatura | profesor |
|---|---|
| Programación | Marta Ruiz |
| Bases de Datos | Pedro Salas |
| Entornos de Desarrollo | Lucía Ferrer |
| Lenguajes de Marcas | Lucía Ferrer |
| Sistemas Informáticos | Hugo Navas |
| Inglés Técnico | Sin asignar |

*6 filas*

Y evitar la división por cero (en SQLite dividir entre 0 da `NULL`; en otros motores da un **error**, y `NULLIF` evita el error):

```sql
SELECT 10 / NULLIF(0, 0) AS resultado;
```

Resultado:

| resultado |
|---|
| NULL |

*1 fila*

## Una condición como valor

Una comparación puede usarse como un valor: en SQLite devuelve `1` (verdadero) o `0` (falso), y por eso se puede sumar para contar:

```sql
SELECT COUNT(*) AS notas, SUM(nota >= 5) AS aprobadas FROM notas WHERE convocatoria = 1;
```

Resultado:

| notas | aprobadas |
|---|---|
| 46 | 35 |

*1 fila*

!!! info "Según el motor"
    La suma de condiciones funciona en SQLite y MySQL. En **PostgreSQL** y **Oracle** las condiciones no son números: hay que usar el `CASE` de arriba (por eso es la forma más portable). Algunos motores también tienen `IIF(condición, a, b)` (SQLite, SQL Server) o `IF(condición, a, b)` (MySQL).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| `CASE` sin `ELSE` | Si ninguna condición se cumple, devuelve `NULL`: añade el `ELSE` |
| Condiciones en mal orden | Gana la primera que se cumple: de la más restrictiva a la más general |
| `WHERE col = NULL` | `IS NULL` |
| Un cálculo con un `NULL` que «borra» el resultado | `COALESCE` para dar un valor por defecto |
| Dividir entre una columna que puede valer 0 | `NULLIF(columna, 0)` |

## Para practicar

Los ejercicios S6.1 a S6.3 de [S6 · Ejercicios](ejercicios.md) practican `CASE` y `COALESCE`.
