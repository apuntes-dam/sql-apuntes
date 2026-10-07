# 5.1 Funciones de agregado

Una **función de agregado** toma **muchas filas** y devuelve **un solo valor**: cuántas hay, su suma, su media...

| Función | Devuelve |
|---|---|
| `COUNT(*)` | El número de filas |
| `COUNT(columna)` | El número de filas donde la columna **no es `NULL`** |
| `COUNT(DISTINCT columna)` | El número de valores **distintos** (sin `NULL`) |
| `SUM(columna)` | La suma |
| `AVG(columna)` | La media |
| `MIN(columna)`, `MAX(columna)` | El menor y el mayor |

## Contar

```sql
SELECT COUNT(*) AS alumnos FROM alumnos;
```

Resultado:

| alumnos |
|---|
| 14 |

*1 fila*

```sql
SELECT COUNT(DISTINCT ciudad) AS ciudades FROM alumnos;
```

Resultado:

| ciudades |
|---|
| 4 |

*1 fila*

## Sumar, promediar, mínimos y máximos

```sql
SELECT COUNT(*) AS notas,
       MIN(nota) AS minima,
       MAX(nota) AS maxima,
       ROUND(AVG(nota), 2) AS media
FROM notas
WHERE convocatoria = 1;
```

Resultado:

| notas | minima | maxima | media |
|---|---|---|---|
| 46 | 2.5 | 10.0 | 6.45 |

*1 fila*

Fíjate en el `WHERE`: **filtra primero** (solo las notas de la convocatoria 1) y **después** se calcula el resumen. Y `ROUND(..., 2)` redondea la media a dos decimales.

Una consulta con agregados **sin `GROUP BY`** devuelve **una sola fila**, aunque la tabla tenga miles.

## Los NULL en los agregados

Las funciones de agregado (salvo `COUNT(*)`) **ignoran los `NULL`**. Es la diferencia entre `COUNT(*)` y `COUNT(columna)`:

```sql
SELECT COUNT(*)        AS alumnos,
       COUNT(id_grupo) AS con_grupo
FROM alumnos;
```

Resultado:

| alumnos | con_grupo |
|---|---|
| 14 | 13 |

*1 fila*

`COUNT(*)` cuenta las 14 filas; `COUNT(id_grupo)` solo las 13 que tienen grupo (Irene tiene `NULL`). Lo mismo con las medias: el `NULL` no cuenta como 0, **no se tiene en cuenta**.

Y una trampa más: sobre un conjunto **vacío**, `COUNT` da 0, pero `SUM`, `AVG`, `MIN` y `MAX` dan **`NULL`**:

```sql
SELECT COUNT(*) AS filas, SUM(nota) AS suma, AVG(nota) AS media FROM notas WHERE nota > 20;
```

Resultado:

| filas | suma | media |
|---|---|---|
| 0 | NULL | NULL |

*1 fila*

## Mezclar agregados y columnas normales

!!! warning "No mezcles columnas sueltas con agregados sin agrupar"
    `SELECT nombre, COUNT(*) FROM alumnos;` no tiene sentido: ¿qué `nombre` mostraría, si el `COUNT` resume las 14 filas? La mayoría de los motores (**MySQL** con la configuración actual, **PostgreSQL**, **Oracle**) lo rechazan con un error. **SQLite lo acepta** y devuelve un valor cualquiera, lo que es peor porque el error pasa desapercibido:

    ```sql
    SELECT nombre, COUNT(*) AS alumnos FROM alumnos;
    ```
    
    Resultado:
    
    | nombre | alumnos |
    |---|---|
    | Ana | 14 |
    
    *1 fila*
    
    La solución correcta es agrupar (siguiente apartado).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Esperar que `AVG` cuente los `NULL` como 0 | Los ignora; si quieres contarlos como 0, hay que convertirlos (unidad 6) |
| Usar `COUNT(columna)` queriendo contar filas | `COUNT(*)` cuenta filas; `COUNT(columna)` cuenta no nulos |
| Un agregado en el `WHERE` (`WHERE AVG(nota) > 5`) | Los agregados no pueden ir en `WHERE`: usa `HAVING` o una subconsulta |
| Mezclar columnas y agregados sin `GROUP BY` | Agrupar |
| Olvidar que `SUM` de nada es `NULL` | Tenerlo en cuenta al mostrar o usar el resultado |

## Para practicar

Los ejercicios S5.1 y S5.2 de [S5 · Ejercicios](ejercicios.md) practican los agregados.
