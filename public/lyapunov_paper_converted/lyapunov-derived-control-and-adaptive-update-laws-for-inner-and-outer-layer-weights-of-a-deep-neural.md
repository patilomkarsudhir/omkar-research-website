#### IEEE CONTROL SYSTEMS LETTERS, VOL. 6, 2022
1855
Lyapunov-Derived Control and Adaptive Update
Laws for Inner and Outer Layer Weights of a
Deep Neural Network

Omkar Sudhir Patil
, Graduate Student Member, IEEE, Duc M. 

Le
, Max L. 

Greene
,
and Warren E. 

Dixon
, Fellow, IEEE

Abstract—Lyapunov-based real-time update laws are
well-known for neural network (NN)-based adaptive con-
trollers that control nonlinear dynamical systems using
single-hidden-layer NNs. 

However, developing real-time
weight update laws for deep NNs (DNNs) remains an open
question. 

This letter presents the ﬁrst result with Lyapunov-
based real-time weight adaptation laws for each layer of
a feedforward DNN-based control architecture, with stabil-
ity guarantees. 

Additionally, the developed method allows
nonsmooth activation functions to be used in the DNN to
facilitate improved transient performance. 

A nonsmooth
Lyapunov-based stability analysis proves global asymp-
totic tracking error convergence. 

Simulation results are
provided for a nonlinear system using DNNs with leaky
rectiﬁed linear unit (LReLU) and hyperbolic tangent activa-
tion functions to demonstrate the efﬁcacy of the developed
method.

Index Terms—Deep neural networks, deep learning,
adaptive control, Lyapunov methods, nonlinear control
systems.

I. 

INTRODUCTION
N
EURAL networks (NNs) are universal function approx-
imators that are capable of modeling continuous func-
tions over a compact domain [1]. 

Although NNs with a
single hidden-layer are capable of approximating general
nonlinear functions, deep NNs (DNNs) provide improved
performance [2]. 

Moreover, DNNs are exponentially more
expressive than shallow NNs in terms of the total number of
neurons required to achieve the same accuracy in function
approximation [3].

Manuscript
received
September
14,
2021;
revised
November
24,
2021;
accepted
December
9,
2021.
Date
of
publication
December 14, 2021; date of current version December 22, 2021.
This work was supported in part by NSF under Award 1762829; in
part by the Ofﬁce of Naval Research under Grant N00014-13-1-0151;
and in part by the Air Force Ofﬁce of Scientiﬁc Research (AFOSR)
under
Award
FA9550-18-1-0109
and
Award
FA9550-19-1-0169.
Recommended by Senior Editor C. 

Seatzu. 

(Corresponding author:
Omkar Sudhir Patil.)
The authors are with the Department of Mechanical and Aerospace
Engineering, University of Florida, Gainesville, FL 32611 USA (e-mail:
patilomkarsudhir@uﬂ.edu;
ledan50@uﬂ.edu;
maxgreene12@uﬂ.edu;
wdixon@uﬂ.edu).
Digital Object Identiﬁer 10.1109/LCSYS.2021.3134914

Motivated by recent advances in DNNs, researchers have
explored the use of DNN-based control architectures. 

DNN-
based techniques often employ optimization methods to train
the DNN weights by minimizing a loss function over a train-
ing dataset [4]. 

Results in [5]–[7] utilize such ofﬂine DNN
training techniques to approximate explicit model predictive
control laws. 

However, such ofﬂine methods pose limitations
since training typically requires large amounts of data, and the
resulting feedforward terms are implemented as an open-loop
approximator based on the ofﬂine training.
In contrast to ofﬂine training, NN weight update laws
derived from Lyapunov-based stability analysis methods have
been developed to adjust the NN weights in real-time as
an adaptive closed-loop feedforward term [8]. 

Although NN-
based adaptive architectures are well-established, these meth-
ods only apply to NNs with a single hidden-layer. 

The complex
nature of DNNs being nested nonlinear parameterizations
of inner-layer activation functions, weights, and bias terms
presents challenges that preclude development of real-time
adaptation laws with Lyapunov-based methods.
Motivated by function approximation abilities of DNNs,
emerging results in [9]–[12] develop real-time DNN-based
adaptive architectures. 

In [9] and [10], real-time DNN-based
adaptive architectures are developed for model reference
adaptive control. 

Similarly, results in [11] generalize the
DNN-based adaptive architecture to general nonlinear systems.
However, such results only update the output-layer weights in
real-time. 

While the output-layer weights are updated in real-
time, data is collected and used to train the inner-layer weights
iteratively over discrete training periods via traditional ofﬂine
techniques. 

In [12], insights are provided into the development
of real-time adaptive weight update laws for individual layers
of a feedforward DNN based on a modular design. 

Modular
adaptive designs develop mild constraints on the adaptation
laws and provide stability guarantees based on the worst-case
scenario of the developed constraints. 

Although the modular
adaptive approach provides constraints on the weight update
laws, these constraints are only sufﬁcient and lack insights on
how to best design the inner-layer weight adaptation laws.
This letter presents the ﬁrst result with Lyapunov-based
real-time weight adaptation laws for each layer of a DNN. 

A

2475-1456 c⃝2021 IEEE. 

Personal use is permitted, but republication/redistribution requires IEEE permission.
See https://www.ieee.org/publications/rights/index.html for more information.

Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.


---
*Page 2*
#### 1856
IEEE CONTROL SYSTEMS LETTERS, VOL. 6, 2022
general uncertain nonlinear system is considered. 

To address
the challenges posed by nested nonlinear parameterizations
of the inner-layer DNN weights, we develop a recursive
representation of the inner-layer DNN structure to facili-
tate the analysis. 

Then, a Taylor’s ﬁrst order approximation
of the uncertainty is recursively derived. 

Subsequently, the
update laws are derived from a Lyapunov-based stability
analysis, in which the ﬁrst-order terms are canceled by the
weight update law-based terms. 

The remaining terms in the
Lyapunov-based analysis are eliminated using a robust control
approach.
The adaptation laws developed in this letter depend on gra-
dients of activation functions. 

The adaptation laws contain
discontinuities if an activation function with a discontinuous
gradient is used in the DNN architecture. 

Nonsmooth acti-
vation functions such as rectiﬁed linear units (ReLUs), leaky
ReLUs (LReLUs) [13], maxout [14], etc. 

are often preferred
over sigmoidal activation functions, since they empirically
exhibit improved function approximation performance while
also overcoming the vanishing gradient problem [4, Ch. 

6].
As previously noted, the discontinuities in gradients of these
activation functions pose difﬁculties in facilitating the standard
Lyapunov-based analysis. 

In this letter, a nonsmooth analysis
is performed to address the challenges of including nons-
mooth activation functions. 

The nonsmooth Lyapunov-based
analysis guarantees global asymptotic tracking error conver-
gence. 

Simulation results are provided for a nonlinear system
using DNNs with leaky ReLU and hyperbolic tangent acti-
vation functions to demonstrate the efﬁcacy of the developed
method. 

A comparison of a DNN with leaky ReLU activation
functions to a DNN with hyperbolic tangent activation func-
tions shows improved tracking and function approximation
performance while using the DNN with leaky ReLU activation
functions.
Notation and Preliminaries: The space of essentially
bounded Lebesgue measurable functions is denoted by L∞.

The right-to-left matrix product operator is represented by
↶
,

i.e.,
↶
m

`p=1 Ap = Am `. . . A2A1 and
↶
m

`p=a Ap = 1 if a > m`. 

The
vectorization operator is denoted by vec(·), i.e., given A ≜
[ai,j] ∈Rn×m, vec(A) ≜[a1,1, . 

. 

. 

, a1,m, . 

. 

. 

, an,1, . 

. 

. 

, an,m]T.
The p-norm is denoted by ∥·∥p, where the subscript is sup-
pressed when `p = 2`. 

The Frobenius norm is denoted by
∥·∥F
≜∥vec(·)∥. 

The Kronecker product is denoted by
⊗. 

Function compositions are denoted using the symbol ◦,
e.g., (g ◦h)(x) = g(h(x)), given suitable functions f and g.
The Filippov set-valued map deﬁned in [15, Equation 2b] is
denoted by K[·]. 

Consider a Lebesgue measurable and locally
essentially bounded function h : Rn × `R≥0 →Rn`. 

Then, the
function y : I →Rn is called a Filippov solution of ˙`y = h(y, t)
on the interval I ⊆R≥0 if y is absolutely continuous on I and
˙y ∈K[h](y, t) for almost all t ∈I`. 

The notation F : A ⇒B
denotes a set-valued map from set A to set B. 

Given some
functions f and g, the notation f(y) = Om(g(y)) means that
there exists some constants M ∈`R>0 and y0 ∈R such that
∥f(y)∥≤M∥g(y)∥m for all y ≥y0`.
Fact 1 [16, Proposition 7.1.9]: Given any A ∈Rp×a, B ∈
Ra×r, and C ∈Rr×s, vec(ABC) = (CT ⊗A)vec(B).

#### II. UNKNOWN SYSTEM DYNAMICS
AND CONTROL DESIGN
Consider
a
control-afﬁne
nonlinear
dynamic
system
modeled as

˙`x = f(x) + u,
(1)`

where x : `R≥0 →Rn denotes a Filippov solution1 to (1),
f : Rn →Rn denotes an unknown differentiable function, and
u : R≥0 →Rm denotes a control input`. 

The control objective
is to track a user-deﬁned reference trajectory xd : `R≥0 →
Rn`. 

The reference trajectory is designed to be continuously
differentiable, such that xd(t) ∈, ∀t ∈`R≥0, and ˙xd ∈L∞,
where  ⊂Rn denotes a known compact set`. 

To quantify
the tracking objective, the tracking error e : `R≥0 →Rn is
deﬁned as`

e ≜x −xd.
(2)

A. Deep Neural Network Architecture

A variety of DNN architectures are known to approximate
any given continuous function on a compact set, based on
universal approximation theorems that can be invoked case-
by-case for DNN architectures [18]. 

Let  : Rn × RL0×L1 ×
. 

. 

.×RLk×Lk+1 →Rn denote the feedforward DNN architecture
deﬁned as

(xd, V0, V1, . . . , Vk) ≜

VT
k φk ◦· · · ◦VT
1 φ1

VT
0 xda

, (3)

where xda : `R≥0 →Rn+1 denotes the augmented desired
state xda ≜[ xT
d
1 ]T, and k ∈N denotes the total num-
ber of hidden-layers`. 

The matrix of weights and biases at
the jth layer is denoted by Vj ∈RLj×Lj+1, where Lj ∈N
denotes the number of nodes in the jth inner-layer for all
j ∈{0, . 

. 

. 

, k}, with L0 ≜n + 1 and Lk+1 ≜n. 

The vector
of smooth2 activation functions at the jth layer is denoted by
φj : RLj →RLj. 

If the DNN involves multiple types of acti-
vation functions at each layer, then φj may be represented as
φj ≜[ςj,1 . 

. 

. 

ςj,Lj−1
1]T, where ςj,i : R →R denotes the
activation function at the ith node of jth layer. 

Note that xda
and φj are augmented with 1 to facilitate the inclusion of a
bias term. 

The DNN architecture in (3) can also be represented
recursively as

j ≜
VT
j φj

j−1

,
j ∈{1, . . . , k},
VT
0 xda,
`j = 0,
(4)`

and (xd, V0, . 

. 

. 

, Vk) = k, where j : Rn × RL0×L1 ×
. 

. 

. 

× RLj×Lj+1
→
RLj+1
denotes (xd, V0, . 

. 

. 

, Vj)
→
j(xd, V0, . 

. 

. 

, Vj). 

The universal function approximation
property states that the function space of DNNs given
by (3) is dense in C() [18, Th. 

3.2], where C() denotes
the space of functions continuous over . 

For any given

1We consider generalized solutions such as Filippov or Krasovskii solutions
instead of classical solutions to facilitate a nonsmooth control design. 

These
solutions are guaranteed to exist for nonsmooth systems with Lebesgue mea-
surable and locally essentially bounded right-hand-sides [17, Proposition 3],
whereas classical solutions might not exist.
2Although φj is deﬁned as a smooth function, the subsequent analysis
allows the inclusion of nonsmooth activation functions by modeling them
via a switching mechanism involving smooth functions.

Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.


---
*Page 3*
PATIL et al.: LYAPUNOV-DERIVED CONTROL AND ADAPTIVE UPDATE LAWS FOR INNER AND OUTER LAYER WEIGHTS
1857

f
∈
C() and prescribed ε
∈
`R>0, there exist some
k, Lj
∈
N, and corresponding ideal weights and biases,
V∗
j ∈RLj×Lj+1, ∀j ∈{0, `. 

. 

. 

, k}, such that supxd∈ ∥f(xd) −
(xd, V∗
0, V∗
1, . 

. 

. 

, V∗
k )∥≤ε. 

Then the unknown function
in (1) can be modeled as

f(xd) = (xd, V∗
0, V∗
1, . . . , V∗
k ) + ε(xd),
(5)

where ε : Rn
→
Rn denotes the unknown function
approximation error such that supxd∈ ∥ε(xd)∥≤ε. 

It is
assumed there exists a known constant V ∈`R>0 such that
supxd∈,∀j ∥V∗
j ∥F ≤V (cf`., [19, Assumption 1]).

B. Control Law Development

The universal approximation property makes DNN-based
adaptive control architectures well-suited for unknown dynam-
ics, as in (1) where f(·) is unknown [18, Th. 

3.2]. 

The adaptive
feedforward DNN term is designed as ˆ ≜(xd, ˆV0, . 

. 

. 

, ˆVk),
where ˆVj : `R≥0 →RLj×Lj+1 for all j ∈{0, `. 

. 

. 

, k} denotes the
estimated weight matrix for the jth layer. 

The weight estima-
tion error of the ideal inner-layer weights Vj : `R≥0 →RLj×Lj+1
for all j ∈{0, `. 

. 

. 

, k} is deﬁned as Vj ≜V∗
j −ˆVj. 

The gradi-
ent of the activation function vector at the jth layer is denoted
as φ′
j : RLj →RLj×Lj, and φ′
j(y) ≜
∂
∂zφj(z)|`z=y, ∀y ∈RLj`.
To facilitate the subsequent stability analysis, let the func-
tion fe : Rn ×  →Rn be deﬁned as fe ≜f(x) −f(xd).
By [20, Lemma 5], the function (x, xd) →fe is bounded
as ∥fe∥≤ρ(∥e∥)∥e∥for all x ∈Rn and xd ∈, where
ρ : `R≥0 →R≥0 denotes a known strictly increasing func-
tion`. 

Based on the subsequent stability analysis, the control
input is designed as

u ≜˙xd −ρ(∥e∥)e −k1e −kssgn(e) −ˆ,
(6)

where k1, ks ∈`R>0 are user-deﬁned control gains, and sgn(·)
denotes the vector signum function`. 

The following short-hand
notations are introduced for brevity in the subsequent anal-
ysis: ∗
j
≜j(xd, V∗
0, . 

. 

. 

, V∗
j ), ˆj ≜j(xd, ˆV0, . 

. 

. 

, ˆVj),
j ≜∗
j −ˆj, ∗≜∗
k,  ≜`k = ∗−ˆ, φ∗
j ≜φj(∗
j−1),
ˆφj ≜φj( ˆj−1), and ˆφ′
j ≜φ′
j( ˆj−1)`.
Based on the subsequent analysis, the input layer weight
adaptation law is designed as

vec( ˙ˆV0) ≜proj(	0((

↶
k

`l=1
ˆVT
l ˆφ′
l)(IL1 ⊗xT
da))Te),
(7)`

and the jth layer weight adaptation law is designed as

vec( ˙ˆVj) ≜proj(	j((

↶
k

`l=j+1
ˆVT
l ˆφ′
l)(ILj+1 ⊗ˆφT
j ))Te),
(8)`

∀j ∈{1, . 

. 

. 

, k}, where 	j ∈RLjLj+1×LjLj+1 is a positive-
deﬁnite adaptation gain matrix for all j ∈{0, . 

. 

. 

, k}. 

The
operator proj(·) denotes the projection operator deﬁned in
[21, Appendix E, eq. 

(E.4)], which is used to ensure ˆVj(t) ∈
Bj ≜{θ ∈RLjLj+1 : ∥θ∥`F ≤V}, ∀(t, j) ∈R≥0 × {0, 1, `. 

. 

. 

, k}.

#### III. STABILITY ANALYSIS
A. Closed-Loop Error System Development

Subtracting ˆj from ∗
j , using (4), adding and subtracting
V∗T
j
ˆφj, and rearranging terms yields

`j = VT
j ˆφj + V∗T
j (φ∗
j −ˆφj),
(9)`

∀j ∈{1, . . . , k}, and 0 = VT
0 xda. Using (1), (2), and (6) yields
the closed-loop error system

˙`e = fe +  + ε(xd) −ρ(∥e∥)e −k1e −kssgn(e)`.
(10)

The term  in (10) has a nested nonlinear parameterization
in V∗
j and ˆVj, which precludes the application of traditional
analysis techniques that are used for linearly parameterized
adaptive systems. 

A ﬁrst-order Taylor series approximation is
developed in [19] to overcome the challenges presented by the
nonlinear parameterization for three-layer neural networks. 

To
overcome the nested structure of nonlinear parameterization
in DNNs, we use a recursive approach to develop a ﬁrst-order
Taylor series approximation for φ∗
j , j, and . 

Using the ﬁrst-
order Taylor series approximation in [19, eq. 

(22)] yields

φ∗
`j = ˆφj + ˆφ′
jj−1 + O2j−1

,
(11)`

∀j ∈{1, . 

. 

. 

, k}. 

Substituting (11) into (9), adding and sub-
tracting ˆVT
j ˆφ′
jj−1, and rearranging terms yields

`j = VT
j ˆφj + ˆVT
j ˆφ′
jj−1 + j,
(12)`

where j : `R≥0 →RLj+1is deﬁned as`

j ≜VT
j ˆφ′
jj−1 + V∗T
j O2j−1

,
(13)

∀j ∈{1, . 

. 

. 

, k}. 

Since the term VT
j ˆφj is a vector, VT
j ˆφj =
vec(VT
j ˆφj) = vec( ˆφT
j Vj) = vec( ˆφT
j VjILj+1). 

Applying Fact 1
on vec( ˆφT
j VjILj+1) yields

VT
j ˆφj =

ILj+1 ⊗ˆφT
j
	
vec
Vj

.
(14)

Substituting (14) into (12) yields the recursive representation

`j =

ILj+1 ⊗ˆφT
j
	
vec
Vj

+ ˆVT
j ˆφ′
jj−1 + j,
(15)`

∀j ∈{1, . 

. 

. 

, k}. 

To facilitate the subsequent analysis, the
following lemma yields a generalized expression for j.
Lemma 1: For all j ∈{0, . 

. 

. 

, k}, the term j can be
expressed as

`j =`

j

`i=1`

⎛

⎜⎝

↶
j

`l=i+1
ˆVT
l ˆφ′
l`

⎞

⎟⎠

ILi+1 ⊗ˆφT
i
	
vec
Vi


+

⎛

⎜⎝

↶
j

`l=1
ˆVT
l ˆφ′
l`

⎞

⎟⎠

IL1 ⊗xT
da

vec
V0


+

j

`i=1`

⎛

⎜⎝

↶
j

`l=i+1
ˆVT
l ˆφ′
l`

⎞

⎟⎠i.
(16)

#### Proof: See the Appendix.
Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.


---
*Page 4*
#### 1858
IEEE CONTROL SYSTEMS LETTERS, VOL. 6, 2022
#### B. Nonsmooth Analysis
Let 0 ≜
↶
k

`l=1 ˆVT
l ˆφ′
l, 0 ≜
↶
k`

`l=j+1 ˆVT
l ˆφ′
l, 0 ≜0(IL1 ⊗
xT
da), and j ≜j(ILj+1 ⊗ˆφT
j ), ∀j ∈{1, `. 

. 

. 

, k}, for nota-
tional brevity, where j : `R≥0 →Rn×Lj+1 and j : R≥0 →
RLj+1×LjLj+1, respectively, ∀j ∈{0, `. 

. 

. 

, k}. 

The subsequent
analysis is structured to account for nonsmooth systems. 

Thus,
state-dependent switching between smooth activation func-
tions can also be considered in the analysis. 

Speciﬁcally, a
nonsmooth activation function with a ﬁnite number of dis-
continuities in its gradient can be modeled by a switched
function involving a collection of smooth activation functions.
Let σ ∈N denote the switching index considering the total
number of switching between activation functions in the entire
DNN, where N ⊂N denotes the set of all possible switching
indices. 

Then, the function approximation in (5) can be rep-
resented as f(xd) = k,σ(xd, V∗
0, V∗
1, . 

. 

. 

, V∗
k ) + εσ(xd), such
that (xd, V0, . 

. 

. 

, Vj) →k,σ(xd, V0, . 

. 

. 

, Vj) is smooth for
each σ with the corresponding approximation error εσ(xd).
Thus, φ∗
j , ˆφj, ˆφ′
j, j j, j, and j can also be repre-
sented as the switched functions φ∗
j,σ, ˆφj,σ, ˆφ′
j,σ, j,σ, j,σ,
j,σ, and j,σ, respectively, such that they are continuous for
each σ. 

It is assumed that the bound supxd∈ ∥εσ(xd)∥≤ε
holds for all σ ∈N. 

Using Lemma 1 yields  = k,`σ =
`k
`j=0 j,σvec(Vj) + k
j=1 j,σj,σ`. 

Substituting  into (10)
yields

˙`e = fe +`

k

`j=0
j,σvec(Vj) +`

k

`j=1
j,σj,σ`

+ εσ(xd) −ρ(∥e∥)e −k1e −kssgn(e).
(17)

Additionally, the adaptation laws in (7) and (8) can be rep-
resented using vec( ˙ˆVj) ≜proj(	jT
j,σe), ∀j ∈{0, . 

. 

. 

, k}.

Consequently, vec( ˙Vj) = −proj(	jT
j,σe), ∀j ∈{0, . 

. 

. 

, k}.
Since ∥V∗
j ∥`F ≤V and ∥ˆVj∥F ≤V, ∀j ∈{0, `. 

. 

. 

, k}, it fol-
lows that ∥Vj∥`F = ∥V∗
j −ˆVj∥F ≤2V`. 

Moreover, since xda is
bounded, and φj,σ and φ′
j,σ are continuous for each σ ∈N,
it follows from (9) that φ∗
j,σ, ˆφj,σ, ˆφ′
j,σ, j,σ, and j,σ can be
bounded by known constants for all (j, σ) ∈{0, . 

. 

. 

, k} × N.
Therefore, based on (13), j can be bounded by known con-
stants for all j ∈{1, . 

. 

. 

, k}, and it follows that there exists a
known constant c ∈`R>0 such that`



k

`i=1
i,σi,σ`

 ≤c.
(18)

Let z : `R≥0 →R denote the concatenated function,
z ≜[ eT,
vec( ˜V0)T, `. 

. 

. 

,
vec( ˜Vk)T ]T, where  ≜n +
k
`j=0 LjLj+1 is deﬁned for notational brevity`. 

Let wσ : R ×
`R≥0 →R denote the concatenated right hand sides of (17)
and vec( ˙Vj) = −proj(	jT
j,σe)`. 

Then (17) and vec( ˙Vj) can be
represented by the collection of subsystems ˙`z = wσ(z, t), and
the corresponding switched system is represented by`

˙`z = wϱ(z,t)(z, t),
(19)`

where ϱ : R × `R≥0 →N denotes a state-dependent switch-
ing signal that satisﬁes [22, Assumption 1]`.3 Based on the
result in [22], we establish the invariance properties of (19)
by establishing the invariance properties of ˙`z = wσ(z, t) for
each σ ∈N`. 

Let Fσ : R × `R≥0 ⇒R denote K[wσ](z, t)`.
Then Fσ(z, t) ⊆F′
σ(z, t), where F′
σ : R × `R≥0 ⇒R`

is
deﬁned
as
F′
σ(z, t)
≜
[{k
`j=0 j,σvec(Vj)
+
k
j=1 j,σj,`σ
+ fe`
+ εσ(xd) −ρ(∥e∥)e −k1e} −
ksK[sgn](e); −K[proj](	0T
0,σe); `. 

. 

. 

; −K[proj](	kT
k,σe)].
Theorem 1: For the dynamical system in (1), the con-
troller in (6) and the adaptation laws in (7) and (8) ensure
global asymptotic tracking error convergence in the sense that
lim
t→∞∥e(t)∥= 0, ∀(e(0), ˆV0, . 

. 

. 

, ˆVk) ∈Rn × B0 × . 

. 

. 

× Bk,
provided the gain condition ks > `ε + c` is satisﬁed.
Proof: Consider the candidate common Lyapunov function
VL : R →`R≥0 deﬁned as`

VL(z) ≜1

2eTe + 1

2

k

`j=0
vec(Vj)T	−1
j
vec(Vj),
(20)`

which satisﬁes the inequality α∥z∥2
≤VL(z) ≤α∥z∥2,
where α, α ∈`R≥0 are known constants`. 

Using [22, Def. 

3],
the generalized time-derivative of VL can be computed as
˙Vσ(z, t) ≜
max
p∈∂VL(z) max
q∈Fσ (z,t)pTq, where ∂VL denotes the Clarke

gradient of VL deﬁned in [23, pp. 

39]. 

Since z →VL(z) is con-
tinuously differentiable, ∂VL(z) = {∇VL(z)}, where ∇denotes
the standard gradient operator. 

Thus,

˙Vσ(z, t) =
max
q∈Fσ (z,t)(∇VL(z))Tq

a.e.
≤
max
q∈F′σ (z,t)(∇VL(z))Tq,

where the notation
a.e.
(·) denotes that the relation (·) holds
for almost all t ∈`R≥0`. 

Additionally, using [21, Lemma
E.1.IV],4 the update law-based terms that appear after eval-
uating
max
q∈F′σ (z,t)(∇VL(z))Tq can be upper-bounded as

−vec( ˜Vj)T	−1
j
K

proj

(	jT
j,σe) ≤−vec(Vj)TT
j,σe,
(21)

∀j
∈
{0, . . . , k}.
Thus,
evaluating
max
q∈F′σ (z,t)(∇VL(z))Tq,

using (21) and the fact that eTK[sgn](e) = {∥e∥1} yields

˙Vσ (z, t)
a.e.
≤eT(fe +

k

`j=1
j,σ j,`σ + εσ` (xd) −ρ(∥e∥)e −k1e)`

+ max

k

`j=0
{eTj,σ vec(Vj) −vec(Vj)TT
j,σ e} −ks∥e∥1`.
(22)

Noting
that
eTj,σvec(Vj)
=
(eTj,σvec(Vj))`T
=
vec(Vj)TT
j,σe
since
they
are
scalar,
the
term
max k
j=0{eTj,σvec(Vj) −vec(Vj)TT
j,σe} = 0, ∀σ ∈N`.

3The assumption [22, Assumption 1] is equivalent to the assumption that ϱ
is locally bounded. 

Since the switched system in (19) involves a ﬁnite number
of subsystems, the assumption is always satisﬁed in this letter.
4The lemma says −˜θT	−1proj(μ) ≤−˜θT	−1μ. 

This property also holds
after replacing proj(μ) with K[proj](μ), since K[proj](μ) evaluates as the set
of convex combinations of proj(μ) and μ, whenever proj(μ) is discontinuous.

Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.


---
*Page 5*
PATIL et al.: LYAPUNOV-DERIVED CONTROL AND ADAPTIVE UPDATE LAWS FOR INNER AND OUTER LAYER WEIGHTS
1859

Thus, substituting ∥k
`j=1 jj∥≤c, ∥εσ(xd)∥≤ε, and
eTfe ≤ρ(∥e∥)∥e∥2, (22) can be upper bounded as`

˙Vσ(z, t)
a.e.
≤eT(c + ε −k1e) −ks∥e∥1.

Using −ks∥e∥1 ≤−ks∥e∥, and selecting ks according to the
theorem statement yields

˙Vσ(z, t)
a.e.
≤−k1∥e∥2.
(23)

By invoking [22, Th. 

2], z ∈L∞and ∥e(t)∥→0 as t →∞.
Additionally, z ∈L∞implies Vj, ˆVj ∈L∞, ∀j ∈{0, . 

. 

. 

, k}.
Since  is a locally essentially bounded function, it follows
that ˆ is bounded. 

Therefore, since all terms on the right hand
side of (6) are bounded, it follows that u ∈L∞. 

Moreover,
since φj and φ′
j are locally essentially bounded functions for

all j ∈{0, . . . , k}, it follows from (7) and (8) that ˙ˆVj ∈L∞,
∀j ∈{0, . . . , k}.

#### IV. SIMULATIONS
Four simulation examples are provided to demonstrate the
efﬁcacy of the developed method, and the results are quantita-
tively compared with known baseline methods such as ofﬂine
pre-training and output-layer adaptation [11]. 

The nonlinear
system in (1) is considered with f(x) = [x1x2 tanh(x2) +
sech2(x1), sech2(x1 + x2) −sech2(x2)]T, where `x = [x1, x2]T`.
The desired trajectory is xd(t) = [ sin(2t), −cos(t)]T, the ini-
tial condition is x(0) = [1, 2]T, the control gains are selected
as k1 = 20 and ks = 1, and the bound for projection operator
is selected as `V = 5000`. 

The DNNs in the ﬁrst and second
examples, i.e., DNN1 and DNN2, consist of 6 layers, with 7
neurons in each layer; hence, there is a total of 231 individ-
ual weights in the ﬁrst two examples. 

The DNNs in the third
and fourth examples, i.e., DNN3 and DNN4, consist of 10
layers, with 30 neurons in each layer; hence, there is a total
of 90150 individual weights in the third and fourth examples.
Each simulation is performed for 10 seconds. 

To prevent the
DNN term from having a large initial value, the inner and
output layer weights are initialized as random values from the
uniform distributions U(0, 0.5) and U(0, 0.01), respectively.
DNN1 and DNN3 contain LReLU activation functions given
by ς(y) = y for `y ≥0, and ς(y) = 0`.01y, otherwise. 

The adap-
tation gain for DNN1 and DNN3 is selected using the switched
rule: 	`j = 10ILjLj+1, if ∥[ vecT( ˜V0)
`. 

. 

.
vecT( ˜Vk) ]T∥≤5,
and 	`j = ILjLj+1, otherwise, for all j ∈{0, `. 

. 

. 

, k}. 

DNN2 and
DNN4 contain hyperbolic tangent activation functions given
by ς(y) = tanh(y). 

Unlike LReLUs, saturating activation
functions like hyperbolic tangents suffer from the vanishing
gradient problem [4], i.e., the gradient terms in the update law
vanish as the activation function saturates, which slows down
the weight updates. 

To compensate for vanishing gradients
and for a fair comparison with the LReLU-based DNNs, the
adaptation gain for the hyperbolic tangent activation function-
based DNNs is selected with a relatively larger value of
	`j = 500ILjLj+1`.

Figure 1 shows the plots of DNN weight estimates, track-
ing error, and function estimation error for DNN3 and DNN4,
where ˜f ≜f(x)−ˆ denotes the function estimation error. 

The

Fig. 

1.
Plots of DNN weight estimates, tracking error, and function
approximation error for DNN3 and DNN4. 

The simulation is performed
for 10 seconds. 

For a better visualization of the transient performance,
the plots for LReLU and tanh are shown for 5 and 0.5 seconds, respec-
tively. 

Additionally, we show 150 arbitrarily selected weight estimates out
of the total 90150 weights for a tractable visualization.

#### TABLE I
DNN PERFORMANCE COMPARISON
plots demonstrate that asymptotic convergence of the tracking
error e is achieved in 0.5 s for both the examples. 

Table I
provides a quantitative comparison of the developed method
with ofﬂine training and output-layer adaptation [11], where
eRMS denotes the root mean square (RMS) of e over the time
interval [0, 10], and eRMS,SS and ˜fRMS,SS denote the RMS of e
and ˜f, respectively, over the time interval [5, 10] (i.e., in steady
state). 

For the simulations in Tab. 

I, the robustifying term
kssgn(e) is removed to better quantitatively compare the effects
of the DNN term. 

The ofﬂine pre-trained DNN is trained
using data collected from 600 seconds of an a priori simu-
lation. 

Using LReLUs yields improvement in the steady state
tracking and function estimation performance as compared to
hyperbolic tangent units as evident from the ∥eRMS,SS∥and
∥˜fRMS,SS∥values for DNN1 vs. 

DNN2 and DNN3 vs. 

DNN4.
The developed method provides a decreased ∥eRMS,SS∥but an
increased ∥eRMS∥as compared to ofﬂine pre-training or using
adaptation for only the output-layer. 

This discrepancy is due

Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.


---
*Page 6*
#### 1860
IEEE CONTROL SYSTEMS LETTERS, VOL. 6, 2022
to the initial overshoot in tracking error due to weight adap-
tation. 

The developed method provides a tenfold and twofold
improvement in steady-state function estimation as compared
to ofﬂine pre-training and output-layer adaptation, respectively.

#### V. CONCLUSION
This letter presents Lyapunov-based real-time weight update
laws for each layer of a feedforward DNN. 

Additionally,
the developed method also allows nonsmooth activation func-
tions to be used in the DNN architecture. 

A nonsmooth
Lyapunov-based stability analysis is provided to guaran-
tee global asymptotic tracking error convergence. 

Simulation
results are provided for a nonlinear system using DNNs involv-
ing leaky ReLU and hyperbolic tangent activation functions
to demonstrate the efﬁcacy of the developed method. 

Using
LReLUs yields improvement in the steady-state tracking and
function estimation performance when compared to hyper-
bolic tangent activation functions. 

Although adapting for more
layers might cause initial overshoot in the tracking error,
the developed method provides tenfold and twofold improve-
ment in steady-state function estimation as compared to ofﬂine
pre-training and output-layer adaptation, respectively.

#### APPENDIX
Proof of Lemma 1: We prove this lemma by mathematical
induction. 

Using (4) and Fact 1 yields 0 = VT
0 xda = (IL1 ⊗

xT
da)vec(V0). Since
↶
0

`l=1 ˆVT
l ˆφ′
l = 1, it can be veriﬁed that (16)
also yields 0 = (IL1 ⊗xT
da)vec(V0)`. 

Thus, Lemma 1 holds
for `j = 0`. 

To use induction, assume (16) applies for `j = h−1,
given any arbitrary h ∈{1, `. 

. 

. 

, k}, and evaluate h−1. 

Then,
using (15) with `j = h yields`

`h = (ILh+1 ⊗ˆφT
h )vec
Vh

+ ˆVT
h ˆφ′
hh−1 + h
(24)`

Substituting h−1 into (24) and rearranging terms, it can
be veriﬁed that the obtained expression is the same as that
obtained using (16). 

Thus, Lemma 1 also applies for `j = h`.

#### REFERENCES
[1] K. 

Hornik, “Approximation capabilities of multilayer feedforward
networks,” Neural Netw., vol. 

4, no. 

2, pp. 

251–257, 1991.
[2] Y. 

LeCun, Y. 

Bengio, and G. 

Hinton, “Deep learning,” Nature, vol. 

521,
no. 

7553, pp. 

436–444, 2015.

[3] D. 

Rolnick and M. 

Tegmark, “The power of deeper networks for express-
ing natural functions,” in Proc. 

Int. 

Conf. 

Learn. 

Represent., 2018,
pp. 

1–14.
[4] I. 

Goodfellow, Y. 

Bengio, A. 

Courville, and Y. 

Bengio, Deep Learning,
vol. 

1. 

Cambridge, MA, USA: MIT Press, 2016.
[5] B. 

Karg and S. 

Lucia, “Efﬁcient representation and approximation of
model predictive control laws via deep learning,” IEEE Trans. 

Cybern.,
vol. 

50, no. 

9, pp. 

3866–3878, Sep. 

2020.
[6] M. 

Hertneck, J. 

Köhler, S. 

Trimpe, and F. 

Allgöwer, “Learning an
approximate model predictive controller with guarantees,” IEEE Contr.
Syst. 

Lett., vol. 

2, no. 

3, pp. 

543–548, Jul. 

2018.
[7] J. 

Nubert, J. 

Köhler, V. 

Berenz, F. 

Allgöwer, and S. 

Trimpe, “Safe and
fast tracking on a robot manipulator: Robust MPC and neural network
control,” IEEE Robot. 

Autom. 

Lett., vol. 

5, no. 

2, pp. 

3050–3057,
Apr. 

2020.
[8] F. 

L. 

Lewis, “Nonlinear network structures for feedback control,” Asian
J. 

Control, vol. 

1, no. 

4, pp. 

205–228, 1999.
[9] G. 

Joshi and G. 

Chowdhary, “Deep model reference adaptive control,”
in Proc. 

IEEE Conf. 

Decis. 

Control, Nice, France, 2019, pp. 

4601–4608.
[10] G. 

Joshi, J. 

Virdi, and G. 

Chowdhary, “Asynchronous deep model refer-
ence adaptive control,” in Proc. 

Conf. 

Robot Learn., 2020, pp. 

984–1000.
[11] R. 

Sun, M. 

L. 

Greene, D. 

M. 

Le, Z. 

I. 

Bell, G. 

Chowdhary,
and W. 

E. 

Dixon, “Lyapunov-based real-time and iterative adjust-
ment of deep neural networks,” IEEE Contr. 

Syst. 

Lett., vol. 

6,
pp. 

193–198, Jan. 

2021. 

[Online]. 

Available: https://ieeexplore.ieee.org/
abstract/document/9337905
[12] D. 

M. 

Le, M. 

L. 

Greene, W. 

A. 

Makumi, and W. 

E. 

Dixon, “Real-
time modular deep neural network-based adaptive control of nonlinear
systems,” IEEE Contr. 

Syst. 

Lett., vol. 

6, pp. 

476–481, May 2021.
[Online]. 

Available: https://ieeexplore.ieee.org/document/9432951
[13] A. 

L. 

Maas, A. 

Y. 

Hannun, and A. 

Y. 

Ng, “Rectiﬁer nonlinearities
improve neural network acoustic models,” in Proc. 

Int. 

Conf. 

Mach.
Learn., vol. 

30, 2013, p. 

3.
[14] I.
Goodfellow,
D.
Warde-Farley,
M.
Mirza,
A.
Courville,
and
Y. 

Bengio, “Maxout networks,” in Proc. 

Int. 

Conf. 

Mach. 

Learn., 2013,
pp. 

1319–1327.
[15] B. 

E. 

Paden and S. 

S. 

Sastry, “A calculus for computing Filippov’s differ-
ential inclusion with application to the variable structure control of robot
manipulators,” IEEE Trans. 

Circuits Syst., vol. 

34, no. 

1, pp. 

73–82,
Jan. 

1987.
[16] D. 

S. 

Bernstein, Matrix Mathematics. 

Princeton, NJ, USA: Princeton
Univ. 

Press, 2009.
[17] J. 

Cortes, “Discontinuous dynamical systems,” IEEE Control Syst. 

Mag.,
vol. 

28, no. 

3, pp. 

36–73, Jun. 

2008.
[18] P. 

Kidger and T. 

Lyons, “Universal approximation with deep narrow
networks,” in Proc. 

Conf. 

Learn. 

Theory, 2020, pp. 

2306–2327.
[19] F. 

L. 

Lewis, A. 

Yegildirek, and K. 

Liu, “Multilayer neural-net robot
controller with guaranteed tracking performance,” IEEE Trans. 

Neural
Netw., vol. 

7, no. 

2, pp. 

388–399, Mar. 

1996.
[20] R. 

Kamalapurkar, J. 

A. 

Rosenfeld, J. 

Klotz, R. 

J. 

Downey, and
W. 

E. 

Dixon, “Supporting lemmas for RISE-based control methods,”
2014, arXiv:1306.3432.
[21] M. 

Krstic, I. 

Kanellakopoulos, and P. 

V. 

Kokotovic, Nonlinear and
Adaptive Control Design. 

New York, NY, USA: Wiley, 1995.
[22] R. 

Kamalapurkar, J. 

A. 

Rosenfeld, A. 

Parikh, A. 

R. 

Teel, and
W. 

E. 

Dixon, “Invariance-like results for nonautonomous switched
systems,” IEEE Trans. 

Autom. 

Control, vol. 

64, no. 

2, pp. 

614–627,
Feb. 

2019.
[23] F. 

H. 

Clarke, Optimization and Nonsmooth Analysis. 

Philadelphia, PA,
USA: SIAM, 1990.

Authorized licensed use limited to: University of Florida. 

Downloaded on August 31,2025 at 08:15:06 UTC from IEEE Xplore. 

Restrictions apply.

