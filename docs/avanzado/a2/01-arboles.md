# A2.1 Árboles: organigramas y categorías

!!! info "Para quién es esto"
    Es material **avanzado**. Da por sabido `WITH` y la CTE recursiva de la [unidad 6](../../u06/05-with-ventanas.md).

## Una tabla que apunta a sí misma

En un organigrama, cada empleado tiene **un jefe**, que es otro empleado. En la base de datos eso se guarda con una columna que **apunta a la propia tabla**: `id_jefe` contiene el `id` de otra fila de `empleados`. Quien no tiene jefe (la directora) lleva `NULL`. Para reproducir los ejemplos, ejecuta antes:

```sql
CREATE TABLE empleados (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  puesto  TEXT    NOT NULL,
  salario INTEGER NOT NULL,
  id_jefe INTEGER REFERENCES empleados(id)   -- NULL en quien no tiene jefe
);
INSERT INTO empleados VALUES
  (1, 'Carmen', 'Directora',          5000, NULL),
  (2, 'Luis',   'Jefe de tecnología', 3800, 1),
  (3, 'Marta',  'Jefa de ventas',     3600, 1),
  (4, 'Pablo',  'Desarrollador',      2800, 2),
  (5, 'Sara',   'Desarrolladora',     2900, 2),
  (6, 'Iván',   'Comercial',          2300, 3),
  (7, 'Elena',  'Comercial',          2400, 3),
  (8, 'Raúl',   'Becario',            1200, 4),
  (9, 'Noa',    'Becaria',            1200, 6);
```

Con un `JOIN` normal solo sabes el jefe **directo** de cada uno. Pero «**todos** los que dependen de Luis», sean directos o no, exige recorrer niveles que no se sabe cuántos son. Para eso están las CTE recursivas.

## Cómo funciona una CTE recursiva

Una CTE recursiva tiene **tres partes**:

| Parte | Qué hace |
|---|---|
| **Caso base** | La consulta de arriba: las filas **de partida** |
| **`UNION ALL`** | Junta el caso base con lo que va produciendo el paso recursivo |
| **Paso recursivo** | La consulta de abajo: usa la propia CTE para encontrar el **siguiente nivel** a partir de las filas del nivel anterior |

SQL la ejecuta así: calcula el caso base; después repite el paso recursivo **sobre las filas nuevas** de la vuelta anterior, y se detiene cuando una vuelta **no produce filas nuevas**.

## Todos los subordinados de alguien

Los subordinados de Luis (`id = 2`), de cualquier nivel:

```sql
WITH RECURSIVE subordinados(id, nombre, puesto) AS (
  SELECT id, nombre, puesto FROM empleados WHERE id_jefe = 2      -- los directos de Luis
  UNION ALL
  SELECT e.id, e.nombre, e.puesto
  FROM empleados e
  JOIN subordinados s ON e.id_jefe = s.id                         -- los de los que ya tengo
)
SELECT nombre, puesto FROM subordinados ORDER BY nombre;
```

Resultado:

| nombre | puesto |
|---|---|
| Pablo | Desarrollador |
| Raúl | Becario |
| Sara | Desarrolladora |

*3 filas*

Se leen tres vueltas: **(1)** los directos de Luis, Pablo y Sara; **(2)** los de Pablo y Sara, o sea Raúl (Sara no tiene a nadie); **(3)** los de Raúl, que no hay, y se para. Raúl es **nieto** de Luis: sin recursión no aparecería.

## El nivel y el camino

Una CTE recursiva puede **llevar columnas calculadas** de vuelta en vuelta. Con ellas se guarda **a qué profundidad** está cada uno y **el camino** desde la raíz:

```sql
WITH RECURSIVE arbol(id, nombre, nivel, camino) AS (
  SELECT id, nombre, 0, nombre FROM empleados WHERE id_jefe IS NULL
  UNION ALL
  SELECT e.id, e.nombre, a.nivel + 1, a.camino || ' > ' || e.nombre
  FROM empleados e
  JOIN arbol a ON e.id_jefe = a.id
)
SELECT replace(hex(zeroblob(nivel)), '00', '· ') || nombre AS organigrama,
       nivel, camino
FROM arbol
ORDER BY camino;
```

Resultado:

| organigrama | nivel | camino |
|---|---|---|
| Carmen | 0 | Carmen |
| · Luis | 1 | Carmen > Luis |
| · · Pablo | 2 | Carmen > Luis > Pablo |
| · · · Raúl | 3 | Carmen > Luis > Pablo > Raúl |
| · · Sara | 2 | Carmen > Luis > Sara |
| · Marta | 1 | Carmen > Marta |
| · · Elena | 2 | Carmen > Marta > Elena |
| · · Iván | 2 | Carmen > Marta > Iván |
| · · · Noa | 3 | Carmen > Marta > Iván > Noa |

*9 filas*

* `nivel` empieza en `0` en la raíz y **suma uno** en cada vuelta (`a.nivel + 1`).
* `camino` va **concatenando** el nombre de cada paso (`||`).
* Ordenar por `camino` deja el árbol **en el orden en que se leería un organigrama**: cada jefe seguido de su equipo, y así bajando.
* El truco `replace(hex(zeroblob(nivel)), '00', '· ')` repite `· ` tantas veces como el `nivel` para **sangrar** el nombre.

## Subir en lugar de bajar

El mismo patrón sirve **hacia arriba**: la cadena de jefes de Noa. Basta con **invertir el enlace** en el paso recursivo:

```sql
WITH RECURSIVE jefes(id, nombre, id_jefe, nivel) AS (
  SELECT id, nombre, id_jefe, 0 FROM empleados WHERE nombre = 'Noa'
  UNION ALL
  SELECT e.id, e.nombre, e.id_jefe, j.nivel + 1
  FROM empleados e
  JOIN jefes j ON e.id = j.id_jefe                                 -- el jefe del que ya tengo
)
SELECT nivel, nombre FROM jefes ORDER BY nivel;
```

Resultado:

| nivel | nombre |
|---|---|
| 0 | Noa |
| 1 | Iván |
| 2 | Marta |
| 3 | Carmen |

*4 filas*

## Agregar por ramas: el coste de cada equipo

Un problema típico: «**cuánto cuesta cada equipo**», contando al jefe y a **todo el que depende de él**. Se genera, para cada empleado, **todos sus descendientes**, guardando de qué «raíz» parten, y después se agrupa:

```sql
WITH RECURSIVE equipo(raiz, id, salario) AS (
  SELECT id, id, salario FROM empleados              -- cada uno es raíz de su propio equipo
  UNION ALL
  SELECT eq.raiz, e.id, e.salario
  FROM empleados e
  JOIN equipo eq ON e.id_jefe = eq.id
)
SELECT e.nombre,
       COUNT(*) - 1   AS subordinados,
       SUM(eq.salario) AS coste_equipo
FROM equipo eq
JOIN empleados e ON e.id = eq.raiz
GROUP BY e.id
ORDER BY coste_equipo DESC;
```

Resultado:

| nombre | subordinados | coste_equipo |
|---|---|---|
| Carmen | 8 | 25200 |
| Luis | 3 | 10700 |
| Marta | 3 | 9500 |
| Pablo | 1 | 4000 |
| Iván | 1 | 3500 |
| Sara | 0 | 2900 |
| Elena | 0 | 2400 |
| Raúl | 0 | 1200 |
| Noa | 0 | 1200 |

*9 filas*

`COUNT(*) - 1` quita al propio jefe (que también está en su equipo). Carmen, en lo más alto, acumula **el coste de toda la empresa**.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Olvidar el caso base o que no devuelva filas | Comprueba por separado que la consulta de arriba devuelve algo |
| Enlazar mal el paso recursivo (`e.id = s.id` en lugar de `e.id_jefe = s.id`) | Piensa en **quién apunta a quién** y escribe la condición en voz alta |
| Una recursión **sin fin** | Un árbol de verdad termina solo; si hay ciclos, mira [A2.2](02-grafos.md) |
| Ordenar por `nivel` esperando el orden de organigrama | Para eso hay que ordenar por el **camino**, no por el nivel |
| Usar `UNION` cuando quieres conservar filas repetidas | `UNION ALL` no elimina nada; `UNION` elimina duplicados (y cuesta más) |

## Para practicar

Los ejercicios SA2.1 a SA2.4 de [SA2 · Ejercicios](ejercicios.md) recorren el organigrama hacia abajo y hacia arriba.
