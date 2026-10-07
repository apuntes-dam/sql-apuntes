# 6.6 Triggers

Un **trigger** (disparador) es un fragmento de SQL que **se ejecuta automáticamente** cuando ocurre un `INSERT`, `UPDATE` o `DELETE` en una tabla. Sirve para **reaccionar a los cambios** sin que el programa tenga que acordarse.

## Cuándo y qué

Un trigger se define con tres decisiones:

| Decisión | Opciones |
|---|---|
| **Cuándo** | `BEFORE` (antes del cambio) o `AFTER` (después) |
| **Qué evento** | `INSERT`, `UPDATE` o `DELETE` |
| **Sobre qué tabla** | `ON tabla` |

Dentro del trigger hay dos «filas especiales»: **`OLD`** (la fila **antes** del cambio, en `UPDATE` y `DELETE`) y **`NEW`** (la fila **después**, en `INSERT` y `UPDATE`).

## Ejemplo 1: una auditoría

Cada vez que **cambia una nota**, se guarda automáticamente en una tabla de registro la nota anterior y la nueva:

```sql
CREATE TABLE cambios_notas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  id_alumno     INTEGER NOT NULL,
  id_asignatura INTEGER NOT NULL,
  nota_antes    REAL,
  nota_despues  REAL,
  cuando        TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER auditar_cambio_de_nota
AFTER UPDATE OF nota ON notas
BEGIN
  INSERT INTO cambios_notas (id_alumno, id_asignatura, nota_antes, nota_despues)
  VALUES (OLD.id_alumno, OLD.id_asignatura, OLD.nota, NEW.nota);
END;
UPDATE notas SET nota = 6 WHERE id_alumno = 1 AND id_asignatura = 1 AND convocatoria = 1;
UPDATE notas SET nota = 9.5 WHERE id_alumno = 2 AND id_asignatura = 3;
SELECT id_alumno, id_asignatura, nota_antes, nota_despues FROM cambios_notas;
```

Resultado:

| id_alumno | id_asignatura | nota_antes | nota_despues |
|---|---|---|---|
| 1 | 1 | 3.5 | 6.0 |
| 2 | 3 | 8.0 | 9.5 |

*2 filas*

Nadie ha escrito en `cambios_notas`: lo ha hecho el trigger por su cuenta, **con cada** `UPDATE` de una nota. Quién cambie la nota (un programa, una persona desde una consola) da igual: la auditoría **no se puede olvidar**.

## Ejemplo 2: rechazar datos con un BEFORE

Un trigger `BEFORE` puede **impedir** una operación. Aquí, rechazar notas fuera del rango de 0 a 10:

```sql
CREATE TRIGGER validar_nota
BEFORE INSERT ON notas
WHEN NEW.nota < 0 OR NEW.nota > 10
BEGIN
  SELECT RAISE(ABORT, 'La nota debe estar entre 0 y 10');
END;
INSERT INTO notas VALUES (3, 5, 11, 1);
```

Resultado: **error**

```text
IntegrityError: La nota debe estar entre 0 y 10
```

(Para una regla tan sencilla es **mejor un `CHECK`** en la tabla, como en la unidad 3: es más claro. Los triggers valen para reglas que un `CHECK` no puede expresar, como las que consultan otras tablas.)

## Cómo se escriben según el motor

La idea es la misma, pero la sintaxis cambia bastante:

| Motor | Particularidades |
|---|---|
| **SQLite** | `BEGIN ... END` con sentencias; puede llevar `WHEN` |
| **MySQL** | Obligatorio `FOR EACH ROW`; varias sentencias dentro de `BEGIN ... END` |
| **PostgreSQL** | El trigger **llama a una función** escrita aparte (`CREATE FUNCTION ... RETURNS trigger`) con `EXECUTE FUNCTION` |
| **Oracle** | Bloques PL/SQL (`BEGIN ... END;`) con `:OLD` y `:NEW` |

## Triggers frente a otras herramientas

| Se quiere... | Mejor herramienta |
|---|---|
| Una regla sobre **una columna** | `CHECK`, `NOT NULL`, `UNIQUE` |
| Que se mantenga la **coherencia entre tablas** | Clave foránea con `ON DELETE` / `ON UPDATE` |
| Una **auditoría** o una **copia derivada** que nadie debe olvidar | Trigger |
| Una regla de negocio compleja | Normalmente, el programa (o un procedimiento almacenado) |

## Procedimientos y funciones almacenadas

MySQL, PostgreSQL, Oracle y SQL Server permiten guardar **programas completos dentro de la base de datos** (con variables, condiciones y bucles) y llamarlos por su nombre: los **procedimientos almacenados** y las **funciones almacenadas**. **SQLite no los tiene**, así que no se pueden mostrar ejecutados aquí. Como ejemplo de la idea, en **MySQL** un procedimiento que sube la nota de una asignatura se escribiría (*sin ejecutar*):

```sql
DELIMITER //
CREATE PROCEDURE subir_notas(IN asignatura INT, IN puntos DECIMAL(3,1))
BEGIN
  UPDATE notas SET nota = LEAST(nota + puntos, 10) WHERE id_asignatura = asignatura;
END //
DELIMITER ;

CALL subir_notas(4, 0.5);
```

Ventajas: la lógica está **junto a los datos**, se reutiliza desde cualquier programa y se pueden dar permisos por procedimiento. Inconvenientes: es difícil de **probar y versionar**, y **se ata al motor** (el código no es portable).

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Triggers que **modifican otras tablas** que a su vez tienen triggers (cadenas difíciles de seguir) | Pocos triggers, sencillos y documentados |
| Lógica de negocio «escondida» en triggers que nadie recuerda | Documentarlos y usarlos solo para lo que no se puede hacer de otra forma |
| Un trigger que se dispara a sí mismo sin parar | Cuidado con las modificaciones sobre la misma tabla |
| Usar un trigger para algo que resuelve un `CHECK` | Usar la restricción |
| Olvidar que el trigger se ejecuta **por cada fila** afectada | Probar con consultas que cambian muchas filas |

## Para practicar

El ejercicio S6.10 de [S6 · Ejercicios](ejercicios.md) practica los triggers.
