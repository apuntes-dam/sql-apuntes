# A1.2 Rankings, cuantiles y comparaciones

Esta página usa las notas del instituto y la tabla `ventas` de la [página anterior](01-marcos.md) (con sus sentencias de creación).

## NTILE: repartir en grupos del mismo tamaño

`NTILE(n)` reparte las filas, ya ordenadas, en **`n` grupos de tamaño casi igual**. Con `NTILE(4)` salen **cuartiles**. Las notas de Bases de Datos, de mayor a menor (13 notas: el primer grupo se queda con una más porque 13 no se reparte exacto entre 4):

```sql
SELECT a.nombre, n.nota,
       NTILE(4) OVER (ORDER BY n.nota DESC) AS cuartil
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
WHERE n.id_asignatura = 2 AND n.convocatoria = 1
ORDER BY n.nota DESC;
```

Resultado:

| nombre | nota | cuartil |
|---|---|---|
| Raúl | 9.0 | 1 |
| Iván | 8.5 | 1 |
| Marta | 8.0 | 1 |
| Sara | 7.5 | 1 |
| Dani | 7.0 | 2 |
| Lola | 7.0 | 2 |
| Luis | 6.5 | 2 |
| Ana | 6.0 | 3 |
| Marcos | 4.5 | 3 |
| Pablo | 3.5 | 3 |
| Elena | 3.0 | 4 |
| Noa | 2.5 | 4 |
| Álex | 2.5 | 4 |

*13 filas*

## PERCENT_RANK y CUME_DIST: en qué posición se está

* `PERCENT_RANK()` da la posición como un número de **0 a 1**: **qué proporción de filas queda por debajo** (la primera vale 0, la última, 1).
* `CUME_DIST()` da **qué proporción de filas tienen un valor menor o igual** (nunca es 0; la última vale 1).

```sql
SELECT a.nombre, n.nota,
       ROUND(PERCENT_RANK() OVER (ORDER BY n.nota), 2) AS percentil,
       ROUND(CUME_DIST()    OVER (ORDER BY n.nota), 2) AS acumulada
FROM notas n
JOIN alumnos a ON a.id = n.id_alumno
WHERE n.id_asignatura = 2 AND n.convocatoria = 1
ORDER BY n.nota
LIMIT 6;
```

Resultado:

| nombre | nota | percentil | acumulada |
|---|---|---|---|
| Noa | 2.5 | 0.0 | 0.15 |
| Álex | 2.5 | 0.0 | 0.15 |
| Elena | 3.0 | 0.17 | 0.23 |
| Pablo | 3.5 | 0.25 | 0.31 |
| Marcos | 4.5 | 0.33 | 0.38 |
| Ana | 6.0 | 0.42 | 0.46 |

*6 filas*

## LAG y LEAD: mirar la fila anterior o la siguiente

`LAG(x)` devuelve `x` de la fila **anterior**; `LEAD(x)`, de la **siguiente**. Admiten un segundo parámetro (**cuántas filas** saltar) y un tercero (el **valor por defecto** si no existe esa fila, en lugar de `NULL`). Con las ventas, la diferencia con el mes anterior:

```sql
SELECT mes, importe,
       LAG(importe) OVER (ORDER BY mes)               AS mes_anterior,
       importe - LAG(importe, 1, importe) OVER (ORDER BY mes) AS diferencia,
       ROUND(100.0 * (importe - LAG(importe) OVER (ORDER BY mes))
             / LAG(importe) OVER (ORDER BY mes), 1)   AS crecimiento_pct
FROM ventas;
```

Resultado:

| mes | importe | mes_anterior | diferencia | crecimiento_pct |
|---|---|---|---|---|
| 2025-01 | 1200 | NULL | 0 | NULL |
| 2025-02 | 1500 | 1200 | 300 | 25.0 |
| 2025-03 | 1100 | 1500 | -400 | -26.7 |
| 2025-04 | 1800 | 1100 | 700 | 63.6 |
| 2025-05 | 1700 | 1800 | -100 | -5.6 |
| 2025-06 | 2100 | 1700 | 400 | 23.5 |
| 2025-07 | 1900 | 2100 | -200 | -9.5 |
| 2025-08 | 2400 | 1900 | 500 | 26.3 |

*8 filas*

En el primer mes no hay anterior: `mes_anterior` es `NULL`, la diferencia es `0` (por el valor por defecto del tercer parámetro) y el porcentaje también es `NULL`.

### Ventanas con nombre

Repetir `OVER (ORDER BY mes)` cansa y se presta a errores. Se puede **definir la ventana una vez** con `WINDOW` y usarla por su nombre:

```sql
SELECT mes, importe,
       LAG(importe)  OVER w AS anterior,
       LEAD(importe) OVER w AS siguiente
FROM ventas
WINDOW w AS (ORDER BY mes);
```

Resultado:

| mes | importe | anterior | siguiente |
|---|---|---|---|
| 2025-01 | 1200 | NULL | 1500 |
| 2025-02 | 1500 | 1200 | 1100 |
| 2025-03 | 1100 | 1500 | 1800 |
| 2025-04 | 1800 | 1100 | 1700 |
| 2025-05 | 1700 | 1800 | 2100 |
| … | … | … | … |

*8 filas* (se muestran 5)

## Los mejores de cada grupo, con empates

Para quedarse con **los dos mejores de cada asignatura**, se numera dentro de cada grupo y se filtra en una CTE. La elección entre `ROW_NUMBER` y `RANK` decide qué pasa con los **empates**:

```sql
WITH r AS (
  SELECT s.nombre AS asignatura, a.nombre, n.nota,
         RANK() OVER (PARTITION BY n.id_asignatura ORDER BY n.nota DESC) AS pos
  FROM notas n
  JOIN alumnos a     ON a.id = n.id_alumno
  JOIN asignaturas s ON s.id = n.id_asignatura
  WHERE n.convocatoria = 1
)
SELECT asignatura, nombre, nota, pos
FROM r
WHERE pos <= 2
ORDER BY asignatura, pos, nombre;
```

Resultado:

| asignatura | nombre | nota | pos |
|---|---|---|---|
| Bases de Datos | Raúl | 9.0 | 1 |
| Bases de Datos | Iván | 8.5 | 2 |
| Entornos de Desarrollo | Iván | 10.0 | 1 |
| Entornos de Desarrollo | Ana | 9.0 | 2 |
| Inglés Técnico | Raúl | 6.5 | 1 |
| Inglés Técnico | Marcos | 6.0 | 2 |
| Lenguajes de Marcas | Sara | 9.5 | 1 |
| Lenguajes de Marcas | Lola | 9.0 | 2 |
| Programación | Iván | 9.5 | 1 |
| Programación | Lola | 8.0 | 2 |
| Programación | Marta | 8.0 | 2 |
| Sistemas Informáticos | Marcos | 9.5 | 1 |
| … | … | … | … |

*13 filas* (se muestran 12)

Con `RANK`, si dos alumnos empatan en la segunda plaza, **salen los dos** (y habrá más de dos filas). Con `ROW_NUMBER` saldrían **exactamente dos** por asignatura, pero la elección entre los empatados sería arbitraria si no añades un segundo criterio de orden.

## Quitar duplicados y quedarse con la última

Otro uso muy habitual: de varias filas por clave, **quedarse con una**. La **última convocatoria** de cada alumno en cada asignatura:

```sql
WITH ordenadas AS (
  SELECT id_alumno, id_asignatura, convocatoria, nota,
         ROW_NUMBER() OVER (
           PARTITION BY id_alumno, id_asignatura
           ORDER BY convocatoria DESC
         ) AS rn
  FROM notas
)
SELECT id_alumno, id_asignatura, convocatoria, nota
FROM ordenadas
WHERE rn = 1 AND id_alumno = 1
ORDER BY id_asignatura;
```

Resultado:

| id_alumno | id_asignatura | convocatoria | nota |
|---|---|---|---|
| 1 | 1 | 2 | 5.5 |
| 1 | 2 | 1 | 6.0 |
| 1 | 3 | 1 | 9.0 |
| 1 | 4 | 2 | 4.0 |

*4 filas*

`ROW_NUMBER` sin empates, con el orden que dice cuál es «la buena» (`convocatoria DESC`), y `rn = 1` se queda con ella.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| `NTILE` cuando el número de filas no se reparte exacto | Los primeros grupos se quedan con una fila más: es lo esperado |
| Confiar en `LAG` sin `ORDER BY` | Sin orden, «la anterior» no significa nada |
| Dividir entre `LAG` sin pensar en el primer mes | Es `NULL` (o `0` con valor por defecto): decide qué mostrar |
| `ROW_NUMBER` para el «top N» con empates sin criterio de desempate | Añade un segundo criterio al `ORDER BY`, o usa `RANK` |
| Repetir la misma ventana en cinco funciones | Defínela una vez con `WINDOW` |

## Para practicar

Los ejercicios SA1.3, SA1.4 y SA1.5 de [SA1 · Ejercicios](ejercicios.md) usan `LAG`, los mejores de cada grupo y `NTILE`.
