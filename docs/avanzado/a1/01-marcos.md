# A1.1 Marcos de ventana y acumulados

!!! info "Para quién es esto"
    Es material **avanzado**. Da por sabido `OVER (PARTITION BY ... ORDER BY ...)` de la [unidad 6](../../u06/05-with-ventanas.md).

## Una tabla de ventas para practicar

Las ventas mensuales de una cafetería. Para reproducir los ejemplos, ejecuta primero esto (se hace una sola vez):

```sql
CREATE TABLE ventas (
  mes     TEXT    PRIMARY KEY,   -- 'AAAA-MM'
  importe INTEGER NOT NULL       -- euros
);
INSERT INTO ventas VALUES
  ('2025-01', 1200), ('2025-02', 1500), ('2025-03', 1100), ('2025-04', 1800),
  ('2025-05', 1700), ('2025-06', 2100), ('2025-07', 1900), ('2025-08', 2400);
```

## Totales acumulados

`SUM(...) OVER (ORDER BY ...)` da el **total acumulado**: en cada fila, la suma de esa fila y de todas las anteriores.

```sql
SELECT mes, importe,
       SUM(importe) OVER (ORDER BY mes) AS acumulado
FROM ventas;
```

Resultado:

| mes | importe | acumulado |
|---|---|---|
| 2025-01 | 1200 | 1200 |
| 2025-02 | 1500 | 2700 |
| 2025-03 | 1100 | 3800 |
| 2025-04 | 1800 | 5600 |
| 2025-05 | 1700 | 7300 |
| 2025-06 | 2100 | 9400 |
| 2025-07 | 1900 | 11300 |
| 2025-08 | 2400 | 13700 |

*8 filas*

## El marco: qué filas entran en el cálculo

Cuando escribes `OVER (ORDER BY mes)`, el cálculo mira **una parte** de las filas: las que hay desde el principio hasta la fila actual. A esa parte se le llama **marco** (*frame*). Se puede cambiar con una cláusula `ROWS BETWEEN ... AND ...`:

| Límite | Significa |
|---|---|
| `UNBOUNDED PRECEDING` | Desde la **primera** fila de la partición |
| `n PRECEDING` | `n` filas **antes** de la actual |
| `CURRENT ROW` | La fila **actual** |
| `n FOLLOWING` | `n` filas **después** de la actual |
| `UNBOUNDED FOLLOWING` | Hasta la **última** fila de la partición |

### Medias móviles

Una **media móvil** alisa las subidas y bajadas: la media de los **3 últimos meses** (el actual y los dos anteriores):

```sql
SELECT mes, importe,
       ROUND(AVG(importe) OVER (
         ORDER BY mes
         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
       ), 1) AS media_3_meses
FROM ventas;
```

Resultado:

| mes | importe | media_3_meses |
|---|---|---|
| 2025-01 | 1200 | 1200.0 |
| 2025-02 | 1500 | 1350.0 |
| 2025-03 | 1100 | 1266.7 |
| 2025-04 | 1800 | 1466.7 |
| 2025-05 | 1700 | 1533.3 |
| 2025-06 | 2100 | 1866.7 |
| 2025-07 | 1900 | 1900.0 |
| 2025-08 | 2400 | 2133.3 |

*8 filas*

Fíjate en los dos primeros meses: no tienen **dos filas anteriores**, así que el marco es más pequeño y la media se calcula con las que hay (el primer mes es solo `1200`, el segundo la media de `1200` y `1500`).

Otros marcos útiles:

| Marco | Qué calcula |
|---|---|
| `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` | Una media **centrada**: la fila, la anterior y la siguiente |
| `ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING` | Lo que **queda por delante**, incluida la fila actual |
| `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` | **Todas** las filas de la partición, en cada fila |

## ROWS, RANGE y los empates

Hay tres formas de medir el marco, y se notan cuando hay **valores repetidos** en el orden:

* **`ROWS`** cuenta **filas físicas**.
* **`RANGE`** trabaja con **valores**: incluye también las filas que tienen **el mismo valor** que la actual.
* **`GROUPS`** cuenta **grupos de empatadas**.

Con las notas de Bases de Datos, que tienen repetidas (hay dos de `2.5` y dos de `7.0`):

```sql
SELECT nota,
       SUM(nota) OVER (ORDER BY nota ROWS  BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS con_rows,
       SUM(nota) OVER (ORDER BY nota RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS con_range
FROM notas
WHERE id_asignatura = 2 AND convocatoria = 1
ORDER BY nota;
```

Resultado:

| nota | con_rows | con_range |
|---|---|---|
| 2.5 | 2.5 | 5.0 |
| 2.5 | 5.0 | 5.0 |
| 3.0 | 8.0 | 8.0 |
| 3.5 | 11.5 | 11.5 |
| 4.5 | 16.0 | 16.0 |
| 6.0 | 22.0 | 22.0 |
| 6.5 | 28.5 | 28.5 |
| 7.0 | 35.5 | 42.5 |
| … | … | … |

*13 filas* (se muestran 8)

Con `ROWS`, cada fila suma **solo hasta ella**, así que las dos filas de `2.5` dan acumulados distintos. Con `RANGE`, **las dos tienen el mismo acumulado**, porque cada una incluye también a su empatada. **Sin escribir nada**, el marco por defecto de `OVER (ORDER BY ...)` es `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`: por eso el acumulado de un orden con empates da el mismo valor a las filas empatadas.

## FIRST_VALUE y LAST_VALUE

`FIRST_VALUE(x)` devuelve el valor de `x` en la **primera** fila del marco, y `LAST_VALUE(x)` en la **última**. Hay una trampa conocida con `LAST_VALUE`:

```sql
SELECT mes, importe,
       FIRST_VALUE(importe) OVER (ORDER BY mes) AS primero,
       LAST_VALUE(importe)  OVER (ORDER BY mes) AS ultimo_mal,
       LAST_VALUE(importe)  OVER (
         ORDER BY mes
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
       ) AS ultimo_bien
FROM ventas;
```

Resultado:

| mes | importe | primero | ultimo_mal | ultimo_bien |
|---|---|---|---|---|
| 2025-01 | 1200 | 1200 | 1200 | 2400 |
| 2025-02 | 1500 | 1200 | 1500 | 2400 |
| 2025-03 | 1100 | 1200 | 1100 | 2400 |
| 2025-04 | 1800 | 1200 | 1800 | 2400 |
| 2025-05 | 1700 | 1200 | 1700 | 2400 |
| 2025-06 | 2100 | 1200 | 2100 | 2400 |
| 2025-07 | 1900 | 1200 | 1900 | 2400 |
| 2025-08 | 2400 | 1200 | 2400 | 2400 |

*8 filas*

`ultimo_mal` sale **igual que `importe`**: el marco por defecto acaba en la **fila actual**, así que «la última fila del marco» es siempre la propia fila. Para ver realmente el último valor hay que **ampliar el marco** hasta `UNBOUNDED FOLLOWING`, como hace `ultimo_bien`. `NTH_VALUE(x, n)` devuelve el de la fila `n` del marco y tiene la misma trampa.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| `LAST_VALUE` que devuelve el valor de la fila actual | Amplía el marco con `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` |
| Un acumulado que da lo mismo en filas empatadas | Es `RANGE`, el marco por defecto: usa `ROWS` si quieres uno distinto por fila |
| Medias móviles sin `ORDER BY` | El marco depende del orden: sin él, no tiene sentido |
| Pensar que el marco `n PRECEDING` rellena con ceros al principio | No: el marco simplemente es **más pequeño** en las primeras filas |
| Usar una función de ventana en el `WHERE` | No se puede: ponla en una CTE o subconsulta y filtra fuera |

## Para practicar

Los ejercicios SA1.1, SA1.2 y SA1.6 de [SA1 · Ejercicios](ejercicios.md) usan acumulados, medias móviles y `FIRST_VALUE`.
