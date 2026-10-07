# A2.2 Grafos, ciclos y series

Un **grafo** es un conjunto de puntos (**nodos**) unidos por líneas (**aristas**): una red de vuelos, de carreteras o de amigos. A diferencia de un árbol, **puede tener ciclos**: se puede volver al punto de partida. Eso obliga a tener cuidado, porque una recursión con ciclos **no termina**.

## Una red de vuelos

Una tabla con los vuelos directos. Para reproducir los ejemplos, ejecuta antes:

```sql
CREATE TABLE vuelos (
  origen  TEXT NOT NULL,
  destino TEXT NOT NULL
);
INSERT INTO vuelos VALUES
  ('Cádiz', 'Sevilla'), ('Sevilla', 'Madrid'), ('Sevilla', 'Málaga'),
  ('Málaga', 'Madrid'), ('Madrid', 'Barcelona'), ('Barcelona', 'Cádiz');
```

Hay un **ciclo**: Cádiz → Sevilla → Madrid → Barcelona → Cádiz.

## Rutas sin repetir ciudades

Para listar **las rutas desde Cádiz hasta Madrid** hay que evitar pasar dos veces por la misma ciudad. Se guarda en la columna `camino` todo lo recorrido y, en el paso recursivo, se **comprueba que el destino no esté ya en el camino**:

```sql
WITH RECURSIVE rutas(ciudad, camino, tramos) AS (
  SELECT 'Cádiz', 'Cádiz', 0
  UNION ALL
  SELECT v.destino, r.camino || ' > ' || v.destino, r.tramos + 1
  FROM vuelos v
  JOIN rutas r ON v.origen = r.ciudad
  WHERE instr(r.camino, v.destino) = 0                -- no repetir ciudades
)
SELECT camino, tramos FROM rutas
WHERE ciudad = 'Madrid'
ORDER BY tramos, camino;
```

Resultado:

| camino | tramos |
|---|---|
| Cádiz > Sevilla > Madrid | 2 |
| Cádiz > Sevilla > Málaga > Madrid | 3 |

*2 filas*

Hay dos rutas: una de **dos tramos** (Cádiz-Sevilla y Sevilla-Madrid) y otra de **tres** (pasando también por Málaga). `tramos` cuenta los vuelos de cada ruta. La comprobación `instr(...) = 0` es lo que **corta el ciclo**: sin ella, la recursión seguiría dando vueltas para siempre.

!!! warning "Sin protección, el ciclo no acaba"
    Si quitas la condición de «no repetir» y la red tiene un ciclo, la CTE **genera filas sin parar**. SQLite no sabe que se repite. Hay dos salvaguardas: **limitar la profundidad** (`WHERE tramos < 4`) o **limitar el resultado** con `LIMIT`.

## Un ciclo sin protección, visto de cerca

Para ver qué pasa, esta misma búsqueda sin la protección, con un `LIMIT` para poder pararla:

```sql
WITH RECURSIVE rutas(ciudad, camino) AS (
  SELECT 'Cádiz', 'Cádiz'
  UNION ALL
  SELECT v.destino, r.camino || ' > ' || v.destino
  FROM vuelos v
  JOIN rutas r ON v.origen = r.ciudad
)
SELECT camino FROM rutas LIMIT 9;
```

Resultado:

| camino |
|---|
| Cádiz |
| Cádiz > Sevilla |
| Cádiz > Sevilla > Madrid |
| Cádiz > Sevilla > Málaga |
| Cádiz > Sevilla > Madrid > Barcelona |
| Cádiz > Sevilla > Málaga > Madrid |
| Cádiz > Sevilla > Madrid > Barcelona > Cádiz |
| Cádiz > Sevilla > Málaga > Madrid > Barcelona |
| Cádiz > Sevilla > Madrid > Barcelona > Cádiz > Sevilla |

*9 filas*

Las rutas **siguen creciendo** (`Cádiz > Sevilla > Madrid > Barcelona > Cádiz > Sevilla...`): es el ciclo. Sin el `LIMIT`, la consulta no terminaría.

## UNION frente a UNION ALL: parar por repetición

Si **no** hace falta el camino y solo quieres saber **a qué ciudades se puede llegar**, hay una salida más sencilla: `UNION` (sin `ALL`) **elimina las filas repetidas**, y la recursión se detiene cuando una vuelta no aporta **ninguna fila nueva**:

```sql
WITH RECURSIVE alcanzables(ciudad) AS (
  SELECT 'Cádiz'
  UNION
  SELECT v.destino
  FROM vuelos v
  JOIN alcanzables a ON v.origen = a.ciudad
)
SELECT ciudad FROM alcanzables ORDER BY ciudad;
```

Resultado:

| ciudad |
|---|
| Barcelona |
| Cádiz |
| Madrid |
| Málaga |
| Sevilla |

*5 filas*

Aunque hay un ciclo, la consulta **termina**: cuando una vuelta solo produce ciudades que ya estaban, no hay filas nuevas y la recursión acaba. Fíjate en que **Cádiz** está en el resultado: se puede volver a ella por el ciclo.

## Generar series: un calendario

Las CTE recursivas no solo recorren datos: también **los inventan**. Una serie de fechas, un día tras otro, con `date(d, '+1 day')`:

```sql
WITH RECURSIVE dias(d) AS (
  SELECT '2025-03-03'
  UNION ALL
  SELECT date(d, '+1 day') FROM dias WHERE d < '2025-03-09'
)
SELECT d,
       CASE strftime('%w', d)
         WHEN '0' THEN 'domingo' WHEN '1' THEN 'lunes'  WHEN '2' THEN 'martes'
         WHEN '3' THEN 'miércoles' WHEN '4' THEN 'jueves' WHEN '5' THEN 'viernes'
         ELSE 'sábado'
       END AS dia_semana
FROM dias;
```

Resultado:

| d | dia_semana |
|---|---|
| 2025-03-03 | lunes |
| 2025-03-04 | martes |
| 2025-03-05 | miércoles |
| 2025-03-06 | jueves |
| 2025-03-07 | viernes |
| 2025-03-08 | sábado |
| 2025-03-09 | domingo |

*7 filas*

El `WHERE d < '2025-03-09'` es la **condición de parada**: cuando la fecha llega a esa, no se genera la siguiente.

### Rellenar los días sin datos

Una aplicación muy útil: una tabla de ventas por día **solo tiene los días con ventas**. Un informe necesita **todos los días**, con `0` en los vacíos. Se genera el calendario y se une con `LEFT JOIN`:

```sql
CREATE TABLE ventas_dia (
  dia     TEXT    PRIMARY KEY,   -- 'AAAA-MM-DD'
  importe INTEGER NOT NULL
);
INSERT INTO ventas_dia VALUES
  ('2025-03-03', 120), ('2025-03-04', 95), ('2025-03-06', 140), ('2025-03-09', 200);
```

```sql
WITH RECURSIVE dias(d) AS (
  SELECT '2025-03-03'
  UNION ALL
  SELECT date(d, '+1 day') FROM dias WHERE d < '2025-03-09'
)
SELECT dias.d AS dia, COALESCE(v.importe, 0) AS importe
FROM dias
LEFT JOIN ventas_dia v ON v.dia = dias.d;
```

Resultado:

| dia | importe |
|---|---|
| 2025-03-03 | 120 |
| 2025-03-04 | 95 |
| 2025-03-05 | 0 |
| 2025-03-06 | 140 |
| 2025-03-07 | 0 |
| 2025-03-08 | 0 |
| 2025-03-09 | 200 |

*7 filas*

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Una recursión con ciclos y sin protección | Guarda el camino y comprueba que no se repita, o usa `UNION`, o limita la profundidad |
| Una serie sin condición de parada | Siempre un `WHERE` en el paso recursivo que acabe la serie |
| Comprobar la repetición con `LIKE` sobre nombres que se parecen | `instr` puede dar falsos positivos si un nombre contiene a otro: guarda los **ids** separados por comas, o un delimitador a cada lado |
| Esperar que `UNION` conserve filas repetidas | `UNION` las elimina; usa `UNION ALL` si las quieres |
| Rutas «más cortas» sin ordenarlas | Ordena por el número de tramos o por una longitud acumulada |

## Para practicar

Los ejercicios SA2.5 y SA2.6 de [SA2 · Ejercicios](ejercicios.md) generan un calendario y buscan las ciudades alcanzables.
