# Permutacja

## Definicja

Permutacja to odwzorowanie funkcji na samą siebie - 
**elementy zmieniają pozycje** z tych na górze, na te na dole

$$
\operatorname{def} \sigma = \left(\begin{matrix}
  a & b & ... & z\\ 
  y_a & y_b & ... & y_z
\end{matrix}\right)\colon\quad 
\sigma\colon X^{|X|} \xrightarrow[1:1]{\operatorname{na}} X^{|X|}
$$

## Ilość

Ilość wszystkich możliwych permutacji danej długości to **silnia** 
z permutowanych elementów

$$
n! = n \cdot (n - 1) \cdot (n - 2) \cdot ... \cdot 2 \cdot 1
$$

## Składanie

Składanie „$\circ$” zwraca zmienioną permutację z prawej strony, tak że dla każdej kolumny, jej dolna wartość jest równa dolnej wartości kolumny, która ma górną wartość równą tej dolnej z prawej permutacji

### Grupa Permutacji

Zbiór permutacji tworzy **grupę z działaniem składania** 

$$
\operatorname{def} G = \left(\left\lbrace
  \sigma\colon\quad \sigma\colon X^{|X|} \xrightarrow[1:1]{\operatorname{na}} X^{|X|}
\right\rbrace, \circ \right)
$$

Twierdzenie Cayleya mówi, że każda grupa jest izomorficzna z grupą permutacji

### Przykład

Przykładowo: $3$-ka z prawej permutacji ma wartość $1$, a jednyka w lewej daje $3$, więc wynikowa to też $3$

$$
\left(\begin{matrix}
  1 & 2 & 3\\
  3 & 1 & 2
\end{matrix}\right) \circ
\left(\begin{matrix}
  1 & 2 & 3\\
  2 & 3 & 1
\end{matrix}\right) =
\left(\begin{matrix}
  1 & 2 & 3\\
  1 & 2 & 3
\end{matrix}\right)
$$

## Odwrotność

Permutacja odwrotna to permutacja o **zamienionych wersach** (góra - dół)

$$
\left(\begin{matrix}
  a & b & ... & z\\ 
  y_a & y_b & ... & y_z
\end{matrix}\right)^{-1} = \left(\begin{matrix}
  y_a & y_b & ... & y_z\\
  a & b & ... & z
\end{matrix}\right)
$$

### Przykład

Przykładowo, po zmianie kolejności wersów są nie po kolei, 
ale można je dowolnie uporządkować i uzyskać właściwą permutację

$$
\left(\begin{matrix}
  1 & 2 & 3\\
  3 & 1 & 2
\end{matrix}\right)^{-1} = \left(\begin{matrix}
  3 & 1 & 2\\
  1 & 2 & 3
\end{matrix}\right) = \left(\begin{matrix}
  1 & 2 & 3\\
  2 & 3 & 1
\end{matrix}\right)
$$

## Symetryczność

Grupa symetryczna stopnia $n$ jest grupą **permutacji liczb naturalnych**

$$
\operatorname{def} S_n = (\{
  \sigma| \sigma:  N^{|N|} \xrightarrow[1:1]{\operatorname{na}} N^{|N|}
\}, \circ);\quad N \subset \mathbb{N} \land |N| = n
$$

## Stałe

Punkty stałe permutacji to takie, które **nie ulegają w niej zmianie**

$$
s\colon\quad \sigma(s) = s
$$

## Nieporządek

Nieporządek to permutacja **bez punktów stałych** - wszystkie ulegają zmianie

$$
\Sigma_n = \left\lbrace\sigma\colon\quad \sigma\colon P \xrightarrow[1:1]{\text{na}} P \land \forall_{x\in{P}}\ \sigma(x) \ne x\right\rbrace;
$$

To ile jest nieporządków o danej długości określa wzór i zależność rekurencyjna

$$
\vert \Sigma_n\vert = n!\sum^n_{k=0}{(-1)^k \over k!} = (n - 1)(|\Sigma_{n-1}| + |\Sigma_{n-2}|)
$$

## Nośnik

Nośnik permutacji to zbiór elementów, które **ulegają zmianie** - nie są punktami stałymi

$$
\operatorname{def} \operatorname{supp}(\sigma) = \{i \in\mathbb{N_+}:\quad \sigma(i) \ne i\}
$$

## Niezależność

Permutacje są niezależne miedzy sobą, **jeśli ich nośniki są całkowicie rozłączne**, wtedy działanie składania jest przemienne

$$
\sigma \circ \eta = \eta \circ \sigma \Leftarrow \operatorname{supp}(\sigma) \cap \operatorname{supp}(\eta) = \emptyset
$$

## Cykliczność

Permutacja jest cyklem, jeśli jej **wszystkie elementy ulegają zmianie**, a wyrazy utworzonego ciągu przechodzą o jedną pozycję

$$
\sigma = (i_1, i_2, ..., i_{k-1}, i_k); \quad\sigma(i_1) = i_2,\ \sigma(i_2) = i_3,\ ...,\ \sigma(i_k) = i_1
$$

### Liczba Stirlinga

**Liczbę różnych permutacji** złożonych z **pewnej ilości cyki** określa liczba Stirlinga pierwszego rodzaju

$$
\operatorname{rz} G = 
\left[|P| \atop k\right] = (n-1)\left[n-1 \atop k\right] + \left[n-1 \atop k - 1\right],\quad
\left[n \atop 1\right] = (n - 1)!
$$

## Transpozycje

Permutacja będąca **cyklem o długości 2** to transpozycja

$$
\sigma = (i_1, i_2)
$$

### Przykład

Transpozycje w cyklu można wyznaczyć przez dobranie sąsiednich elementów (albo ostatniego z pierwszym)

$$
\operatorname{def} \sigma = \left(\begin{matrix}
	1 & 2 & 3 & 4 & 5\\
	3 & 1 & 5 & 4 & 2
\end{matrix}\right) \in S_5
$$

Najpierw trzeba wyznaczyć cykle w permutacji, po czym można od razu zapisać je jako transpozycje

$$
\sigma = (1,3,5,2)\circ(4) = (1,3)(3,5)(5,2)(2,1)(4)
$$

## Inwersja

Inwersja to czynność permutacji, która **zamienia porządek liczb**: pierwsza, która jest **mniejsza** staje się **większą**, od wartości większej

$$
\begin{cases}
a < b\\
\sigma (a) > \sigma (b)
\end{cases}
$$

### Liczba

**Ilość wszystkich inwersji** oznacza się znakiem $I(\sigma)$

## Parzystość

Parzystość mówi o tym:

* czy **ilość cykli nieparzystych** jest parzysta ($1$) albo nie $-1$ - cykle nieparzyste rozbijają się na parzyste, i odwrotnie;
* czy **ilość inwersji** jest parzysta ($1$), czy nie $(-1)$;
* czy **ilość tranzpozycji** jest parzysta ($1$), czy nie ($-1$);

$$
\operatorname{def} \operatorname {sgn}\sigma = (-1)^{I(\sigma)} =\begin{cases}-1, & I(\sigma) \in\{1,3,5,...,2k + 1\} \newline+1,  &I(\sigma) \in\{2,4,6,...,2k\}\end{cases}
$$

### Podgrupa Parzystych

Permutacje parzyste są **podgrupą grupy symetrycznej** $S_n$

$$
S_n > (\{\sigma \in S_n\colon\quad \operatorname{sgn} \sigma = 1\}, \circ)
$$

### Przykład

$$
\operatorname{def} \sigma = \left(\begin{matrix}
	1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9\\
	2 & 1 & 3 & 7 & 6 & 9 & 4 & 5 & 8
\end{matrix}\right) \in S_9
$$

Permutację można rozłożyć na cykle

$$
\sigma = (1,2)(3)(4,7)(5,6,9,8)
$$

Skoro same cykle parzyste i 0 (parzyste) cykli nieparzystych to jest parzysta

## Tożsamość

Permutacja tożsamościowa **nie wprowadza zmian** - jest elementem neutralnym $S_n$

$$
\operatorname{def} \operatorname{id} = \left(\begin{matrix}a & b & ... & z\\ a & b & ... & z\end{matrix}\right)
$$

## Alternacja

Wszystkie **permutacje parzyste** tworzą grupę alternującą

$$
\operatorname{def} A_n = (\{
  \sigma| \sigma:  N^{|N|} \xrightarrow[1:1]{\operatorname{na}} N^{|N|} \land
  \operatorname{sng} \sigma = 1
\}, \circ);\quad N \subset \mathbb{N} \land |N| = n
$$

### Rząd Grupy Alternującej

Permutacji alternujących jest dokładnie **połowa ze wszystkich permutacji**

$$
\operatorname{rz} A_n = {1\over 2}n!
$$

### Generator Grupy Alternującej

Grupę alternującą generują wszystke **permutacje długości 3** 

$$
\forall_{\sigma \in S_3} \langle\sigma\rangle \in A_n
$$
