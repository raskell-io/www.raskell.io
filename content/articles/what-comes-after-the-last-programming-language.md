+++
title = "What Comes After the Last Programming Language"
date = 2026-04-19
description = "If AI generates machine code directly, why are we still running operating systems designed for humans? The answer might be an inference-native OS."

[taxonomies]
tags = ["ai-for-ops", "oss", "edge-systems", "haskell"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "what-comes-after-the-last-programming-language.avif"
og_image = "what-comes-after-the-last-programming-language.png"
+++

In [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), I described three futures for programming languages as AI becomes the primary author of code. Explicit languages for machines. Declarative languages where types are proofs. And ultimately, no language at all, where AI generates machine code directly and the intermediate layer disappears.

I left something out. There is a fourth possibility, and it goes deeper than the language.

What happens to the operating system?

## The operating system was designed for typists

Every operating system in production today, Linux, Windows, macOS, the BSDs, was built on the same foundational assumption: a human writes a program, the program is compiled into a sequence of CPU instructions, and the OS manages the execution of those instructions. Processes. Threads. System calls. Virtual memory. File descriptors. Schedulers. These abstractions exist because the fundamental unit of work is a sequence of CPU operations authored by a human programmer.

This is not an exaggeration. Look at the POSIX specification. `fork()` creates a copy of the calling process. `exec()` replaces the current process image with a new program. `read()` and `write()` move bytes between a process and a file descriptor. `mmap()` maps a file into the process's virtual address space. Every one of these primitives assumes a CPU-centric, sequential execution model where a process is a container for a stream of instructions that the CPU executes one at a time (or a few at a time, with threads).

This made sense for sixty years. Dennis Ritchie and Ken Thompson designed Unix in 1969 around the PDP-7, a machine with a single CPU and 18-bit words. The abstractions they chose, processes, pipes, files as byte streams, were elegant reflections of what the hardware could do. Those abstractions survived because they generalized well. When CPUs got faster, processes got faster. When CPUs got more cores, threads mapped naturally onto them. When networks arrived, sockets extended the file descriptor model. The operating system grew, but the foundational unit of work never changed: a sequence of CPU instructions, managed by a scheduler, isolated by virtual memory.

## How the GPU became an accidental general-purpose computer

The GPU was never meant to be here. Its entire history is a sequence of coincidences.

In the early 1990s, GPUs existed to draw triangles. Silicon Graphics made specialized hardware for 3D rendering, and the rest of the industry followed. NVIDIA's GeForce 256, released in 1999, was marketed as the world's first "GPU," a term NVIDIA invented. Its job was to take vertices and textures from a CPU program, transform them, and rasterize them to a framebuffer. It was a peripheral. A display adapter with math capabilities.

Then game developers started abusing the hardware. Shader programs, originally designed for lighting and surface effects, turned out to be tiny parallel programs that could do arbitrary computation. By the mid-2000s, researchers at Stanford and elsewhere realized you could encode general-purpose math problems as texture operations: matrix multiplications as pixel shaders, fluid simulations as render passes. It was a hack. The GPU did not know it was doing science. It thought it was rendering a really weird image.

NVIDIA saw the opportunity and released CUDA in 2007, giving the GPU a proper programming model for general-purpose computation. But the architecture of the system did not change. CUDA was a userspace library. The GPU driver ran outside the kernel. The operating system still treated the GPU as a display device. The OS scheduled CPU processes and managed CPU memory. The GPU scheduled its own work and managed its own memory, through CUDA, through the driver, outside the OS's view.

Then came cryptocurrency mining. Bitcoin miners discovered that GPUs were vastly more efficient than CPUs for SHA-256 hashing, because the algorithm is embarrassingly parallel and the GPU has thousands of cores. This was the first mass-market workload where the GPU did the economically valuable work and the CPU was just overhead. Mining rigs were machines where the CPU was an afterthought, a cheap Celeron whose only job was to feed work to a rack of GPUs. But the operating system running on that Celeron was still Linux, still managing the GPU through CUDA, still treating it as a peripheral.

Then came machine learning. First training (AlexNet in 2012, the moment deep learning became real), then inference. Each transition was coincidental. Nobody designed GPUs to be good at neural network training. They just happened to have the right characteristics: massive parallelism, high memory bandwidth, and a programming model that could express matrix multiplications. The workloads found the hardware. The hardware did not seek the workloads.

And so we arrived at 2026 with the most important compute workload in a generation, AI inference, running on hardware that was originally designed to render Quake, managed by drivers that bypass the operating system, scheduled by a proprietary runtime that the kernel cannot see or control. The GPU is the most important processor in the machine, and the OS does not know what it is doing.

Nearly twenty years after CUDA, we are still using that model. The workloads have changed beyond recognition. The software stack has not.

## How CPUs and GPUs actually differ

To understand why this matters, it helps to understand how CPUs and GPUs compute differently. Not at the marketing level. At the architectural level.

A CPU is designed for latency. It has a small number of powerful cores (8 to 128 on a modern server chip), each with deep pipelines, branch predictors, out-of-order execution engines, and large caches. Each core is optimized to execute a single thread of instructions as fast as possible. When your program says "if this, then that," the CPU predicts which branch you will take and starts executing it before it knows the answer. When your program accesses memory, the CPU has three levels of cache to hide the latency of going to DRAM. The entire design optimizes for one thing: getting through a single sequence of instructions with minimal delay.

A GPU is designed for throughput. It has thousands of small cores (16,384 CUDA cores on an H100), each simple, each capable of executing one instruction per clock, grouped into blocks that execute the same instruction on different data simultaneously. There is no branch predictor because all threads in a warp (a group of 32) execute the same instruction at the same time. If your program has a branch, both paths execute and the unwanted results are discarded. There is very little cache because the design assumes you are streaming through large data sets, not randomly accessing small ones. The entire design optimizes for one thing: doing the same operation on as many data points as possible simultaneously.

{% diagram(title="CPU vs GPU architecture") %}
CPU (latency-optimized)                 GPU (throughput-optimized)
========================                ============================

+---------+  +---------+               +--+--+--+--+--+--+--+--+--+
| Core 0  |  | Core 1  |  ...  8-128   |  |  |  |  |  |  |  |  |  |
| complex |  | complex |  cores        |  |  |  |  |  |  |  |  |  |
| OoO exec|  | OoO exec|               |  |  |  |  |  |  |  |  |  |
| branch  |  | branch  |               |  SM  |  |  SM  |  |  SM  |
| predict |  | predict |               |  |  |  |  |  |  |  |  |  |
+---------+  +---------+               |  |  |  |  |  |  |  |  |  |
     |            |                     +--+--+--+--+--+--+--+--+--+
+----+----+  +----+----+                      thousands of cores
| L1  32K |  | L1  32K |                      simple, in-order
+---------+  +---------+                      same instruction,
+----+------------+----+                      different data
|     L2  ~1 MB        |
+-----------------------+               +---------------------------+
|     L3  ~32 MB        |               |     HBM  ~80 GB          |
+-----------------------+               |     ~3 TB/s bandwidth    |
|     DRAM  ~512 GB     |               +---------------------------+
|     ~100 GB/s         |
+-----------------------+               One instruction, 16384 data
                                        points at once
One instruction at a time,
very fast
{% end %}

This difference is why matrix multiplication, the core operation in neural network inference, runs three orders of magnitude faster on a GPU. A matrix multiply is thousands of multiply-and-add operations on independent data points. The CPU executes them one at a time (or a few at a time with SIMD), fast but serial. The GPU executes thousands simultaneously, each on its own core. The CPU finishes one row while the GPU finishes the whole matrix.

For traditional software, CPU architecture is perfect. A web server parses HTTP requests (branchy, sequential), queries a database (latency-sensitive, cache-friendly), and formats a response (string operations, unpredictable access patterns). Each request is different. Each code path branches differently. The CPU's branch predictor, out-of-order execution, and deep cache hierarchy are exactly right.

For inference, GPU architecture is perfect. Each layer of a transformer is a dense matrix multiplication followed by an element-wise nonlinearity. Every token in the batch gets the same operations applied to the same weights. There are almost no branches. The data is enormous and streaming. The GPU's thousands of simple cores and high-bandwidth memory are exactly right.

The problem is that we run both workloads on an operating system that only understands the first kind.

## The GPU is becoming the computer

When you run inference on a large language model, the GPU is not assisting the CPU. The GPU is doing the work. The CPU's role is orchestration: loading weights, managing memory, feeding tokens, collecting output. The actual computation, the matrix multiplications that turn a prompt into a response, happens on the GPU. For a 70-billion-parameter model, the GPU does billions of floating-point operations per token. The CPU does bookkeeping.

The numbers make this concrete. An NVIDIA H100 delivers roughly 1,979 teraflops of FP8 compute. The CPU it is paired with, typically an AMD EPYC or Intel Xeon, delivers maybe 2-3 teraflops of FP32. The GPU has three orders of magnitude more compute throughput for the operations that matter in inference. When a request arrives at an inference endpoint, the CPU spends microseconds parsing HTTP and tokenizing text. The GPU spends milliseconds doing the actual thinking. The ratio of useful work is not close.

This inversion has happened gradually enough that we have not fully reckoned with it. We still run inference workloads on Linux. We still manage GPU memory through CUDA driver calls from userspace processes. We still treat the GPU as a device the OS mediates access to, the same way it mediates access to a disk or a network card.

But a disk does not run your business logic. A network card does not make decisions. The GPU increasingly does both. When an AI agent decides whether to approve a transaction, route a request, or generate a response, the decision happens on the GPU. The CPU is the secretary. The GPU is the executive.

If the executive is making the decisions, why is the secretary's office designed for the secretary?

This is not merely an aesthetic complaint. The mismatch has practical consequences. GPU memory management is manual and error-prone. Context switches between GPU workloads are expensive because the OS has no concept of GPU process state. Scheduling is done by the CUDA driver, not by the kernel, which means the OS cannot enforce fairness or priority between GPU workloads the way it enforces them between CPU processes. And isolation, the most critical property for multi-tenant inference, depends entirely on userspace software that the OS does not control or verify.

## What an inference-native OS would look like

Imagine an operating system where inference is the fundamental compute primitive. Not a syscall you invoke. Not a library you link. The basic unit of work.

In a traditional OS, the primitive is a process: an isolated address space running a sequence of CPU instructions with access to file descriptors, network sockets, and memory. The scheduler gives each process time on the CPU. The kernel mediates access to shared resources.

In an inference-native OS, the primitive would be a shard: an isolated execution context with dedicated GPU resources, its own VRAM partition, its own compute units, its own inference pipeline. The scheduler does not give shards time on the CPU. It gives them capacity on the GPU. The kernel does not mediate file descriptors. It mediates model weights, token streams, and attention contexts.

{% diagram(title="Traditional OS vs inference-native OS") %}
Traditional OS                          Inference-native OS
=================                       ====================

Process A  Process B  Process C         Shard A    Shard B    Shard C
   |          |          |                 |          |          |
   v          v          v                 v          v          v
+-------------------------------+    +-------------------------------+
|     CPU scheduler             |    |     GPU scheduler             |
|     (time-slicing)            |    |     (capacity-slicing)        |
+-------------------------------+    +-------------------------------+
   |          |          |                 |          |          |
   v          v          v                 v          v          v
+------+  +------+  +------+        +--------+  +--------+  +--------+
| Core | | Core | | Core  |        | CU     | | CU      | | CU     |
| 0    | | 1    | | 2     |        | slice  | | slice   | | slice  |
+------+  +------+  +------+        +--------+  +--------+  +--------+
                                          |          |          |
   GPU is a peripheral                    v          v          v
   called via ioctl/CUDA              +-------------------------------+
                                      |     VRAM partitions           |
                                      |     (isolated per shard)      |
                                      +-------------------------------+
{% end %}

The analogy that keeps coming back to me is mainframes and timesharing. In the 1960s, computers were batch-processing machines. You submitted a job, waited, got results. Then Multics and later Unix introduced timesharing: multiple users, each with the illusion of having the whole machine, isolated from each other by the OS. The transition was not just a performance improvement. It was a conceptual shift in what the machine was for. It went from "a machine that runs one job at a time" to "a machine that runs many jobs concurrently, safely isolated."

We need the same transition for GPUs. Right now, GPU computing is in its batch-processing era. One workload gets the GPU (or a partition of it, managed by CUDA MPS or MIG), and isolation is an afterthought bolted on by the driver. The inference-native equivalent of timesharing would be an OS that treats GPU capacity the way Unix treats CPU time: a shared resource, securely partitioned, with each tenant unable to see or affect the others.

The isolation model is the critical piece. In a traditional OS, processes are isolated by virtual memory on the CPU side. Two processes cannot read each other's RAM because the page tables prevent it. The MMU (Memory Management Unit) enforces this in hardware. It is not a software convention. It is a physical guarantee.

But GPU memory is a different story. In most systems, GPU memory isolation depends on the CUDA driver, which runs in userspace. NVIDIA's MIG (Multi-Instance GPU) provides hardware partitioning on some GPU models, but it is coarse-grained (up to 7 instances on an A100) and not available on consumer hardware. A vulnerability in the driver, or in any process with GPU access, can potentially read VRAM belonging to another workload. For inference workloads handling sensitive data, this is not acceptable.

Hardware-level isolation is the answer. Intel VT-d IOMMU can enforce DMA translation boundaries so that each GPU partition's VRAM is physically inaccessible to other partitions. Not software-isolated. Hardware-isolated. The same level of guarantee that CPU virtual memory provides, but for GPU resources. The technology exists. It is used in server virtualization today for PCIe passthrough. The question is whether an OS can be built that uses it as a first-class isolation primitive for inference workloads, not as a virtualization feature.

## coconutOS

This is not purely theoretical. I have been building a proof of concept.

[coconutOS](https://github.com/coconut-os/coconutOS) is a capability-based microkernel written in Rust, engineered specifically for GPU-isolated AI inference. It boots on x86-64 hardware via UEFI, and its entire architecture is designed around the idea that the GPU is the primary execution engine.

The choice of a microkernel is deliberate, and it carries historical baggage worth addressing.

The microkernel idea goes back to the 1980s. Andrew Tanenbaum, the computer scientist at Vrije Universiteit Amsterdam, built [Minix](https://www.minix3.org/) as a teaching OS based on the principle that the kernel should do as little as possible: manage memory, schedule tasks, pass messages. Everything else, file systems, drivers, network stacks, runs in userspace as separate processes. If a driver crashes, the kernel restarts it. The system keeps running.

Tanenbaum and Linus Torvalds had a famous debate about this in 1992 on the comp.os.minix newsgroup. Torvalds argued that monolithic kernels were faster and more practical. Tanenbaum argued that microkernels were more reliable and that "Linux is obsolete." Torvalds won the practical argument. Linux became the dominant OS precisely because a monolithic kernel is simpler to build and faster to run when all your workloads are CPU-centric. Putting the file system and drivers in kernel space avoids the overhead of message passing between userspace processes.

But Tanenbaum's argument was about fault isolation, and fault isolation becomes more important as the consequences of failure increase. When the failure is "the file server process crashes and is restarted in 50 milliseconds," a monolithic kernel's performance advantage wins. When the failure is "a GPU driver bug in kernel space lets one tenant's inference workload read another tenant's medical records from VRAM," the calculus changes.

In a monolithic kernel like Linux, the GPU driver runs in kernel space with full access to system memory. A bug in the NVIDIA driver (and there have been many: [CVE-2024-0090](https://nvidia.custhelp.com/app/answers/detail/a_id/5551), [CVE-2024-0092](https://nvidia.custhelp.com/app/answers/detail/a_id/5551), [CVE-2023-31018](https://nvidia.custhelp.com/app/answers/detail/a_id/5491) to name a few from recent years) can compromise the entire system. In a microkernel, the GPU HAL runs as an isolated shard in userspace. A bug in the HAL crashes that shard. The kernel survives. Other shards survive. The failure domain is contained.

Tanenbaum was right about the principle. He was just early about the workload that would make it matter. GPU-isolated inference is that workload. The performance overhead of microkernel message passing is irrelevant when the actual work happens on the GPU and the kernel's job is orchestration, not computation. The CPU side is the control plane. The GPU side is the data plane. A microkernel is the right architecture for a control plane.

The core abstractions:

**Shards, not processes.** Each shard is an isolated address space with its own page tables, running in ring 3. But unlike a traditional process, a shard's primary resource is not CPU time. It is GPU capacity. A shard gets a partition of VRAM, a slice of compute units, and a dedicated HAL (Hardware Abstraction Layer) shard that manages its access to the GPU. The HAL shard itself is unprivileged. It communicates with the kernel through the same capability-based IPC that every other shard uses. There is no "root" equivalent for GPU access.

**Capabilities, not permissions.** Access control is capability-based, inspired by systems like [seL4](https://sel4.systems/) and the research that came out of the University of Cambridge's Computer Laboratory. Each shard holds unforgeable capability tokens that grant access to specific resources: VRAM regions, IPC channels, filesystem paths, GPU compute slices. Capabilities can be granted, revoked, restricted, and inspected. There are no ambient permissions. A shard cannot access anything it does not hold a capability for. This is fundamentally different from Unix permissions, where a root process can access everything. In coconutOS, there is no root. There are only capabilities.

**GPU ASLR.** Each shard's VRAM and MMIO virtual addresses are randomized. Even if an attacker finds a vulnerability in one shard, they cannot predict where another shard's GPU memory is mapped. CPU-side ASLR has been standard since the mid-2000s. The insight is that the same principle applies to GPU resources, and that without it, a GPU memory disclosure vulnerability in one workload can be used to locate and read another workload's model weights or inference state.

**Pledge and unveil for GPUs.** This is one of the design choices I am most attached to, because it comes directly from my years of admiring OpenBSD. Theo de Raadt's `pledge(2)` and `unveil(2)` syscalls are among the most elegant security primitives ever designed. A process calls `pledge("stdio rpath")` and permanently gives up the ability to do anything except read files and use standard I/O. It cannot escalate back. The promise is irreversible.

coconutOS applies the same idea to GPU resources. `pledge_gpu` lets a shard declare that it will only do inference, not training. Once pledged, it cannot allocate new VRAM beyond its partition, cannot modify model weights, cannot access raw compute dispatch. `unveil_vram` lets a shard lock its VRAM view to a specific region. Other regions become physically invisible through the IOMMU. A compromised inference shard cannot undo its own containment because the kernel enforces the pledge at the hardware level.

**The inference stack.** The proof of concept runs a transformer forward pass end-to-end: RMSNorm, multi-head attention with rotary position embeddings (RoPE), SiLU feed-forward networks, softmax. It is based on Andrej Karpathy's [llama2.c](https://github.com/karpathy/llama2.c), adapted to run as a shard with GPU isolation. The kernel preserves FPU and SSE state across preemption using FXSAVE/FXRSTOR, so inference math is not corrupted by context switches. This is a detail that matters: if the scheduler preempts a shard mid-matrix-multiply and does not preserve the floating-point register state, the results will be silently wrong. Traditional OSes handle this for CPU processes. coconutOS handles it for GPU inference shards.

## Why this matters

You might look at coconutOS and think: this is an interesting research project, but nobody is going to replace Linux for AI workloads. And you might be right. Linux is entrenched. CUDA is entrenched. The entire AI infrastructure stack, from PyTorch to vLLM to Triton Inference Server, is built on top of assumptions that coconutOS challenges.

But consider the trajectory.

Five years ago, AI inference was a batch job you ran on a cluster. You uploaded data, kicked off a job, came back later for results. The security model was simple: whoever had SSH access to the machine had access to the GPU. Isolation was a non-issue because there was only one workload.

Today, inference is a real-time service. Companies like Anthropic, OpenAI, and Google serve billions of inference requests per day. Multiple customers share the same GPU hardware. The workloads process sensitive data: medical records, financial transactions, legal documents, personal conversations. The security and isolation requirements have changed fundamentally, but the OS layer has not changed at all. We are running safety-critical, multi-tenant inference workloads on an operating system that was designed in 1991 for running file servers and web servers.

The gap between what we are doing on GPUs and how we manage GPU access is widening. Right now, GPU multi-tenancy in the cloud means trusting the CUDA driver and the hypervisor to keep workloads separated. NVIDIA's MIG helps, but it is only available on data center GPUs (A100, H100), offers coarse-grained partitioning (7 instances maximum), and still relies on the CUDA driver for memory management within each partition. For most use cases, this is fine. For financial services, healthcare, defense, and any context where inference handles regulated data, "trusting the driver" is not a compliance-grade answer.

The analogy is virtualization. Before Xen and KVM, server multi-tenancy meant trusting the host OS to isolate users. It worked until it did not. Hardware virtualization (VT-x) gave us actual isolation guarantees enforced by the CPU. The cloud was built on those guarantees. We need the same thing for GPUs. Hardware-level isolation, enforced by the kernel, with capability-based access control and monotonic privilege restriction, is where this has to go. Whether it looks like coconutOS or like a set of patches to Linux or like NVIDIA building isolation into their next GPU architecture is an implementation question. The architectural direction is not optional.

## The four futures, updated

Looking back at the original post, the timeline extends further than I initially described:

{% diagram(title="The full timeline") %}
Near term        Medium term       Long term         Far horizon
(now)            (2-5 years)       (5-15 years)      (10-20 years)

Explicit         Declarative       Post-language     Inference-native
languages        languages         (AI-native        operating systems
(Vera)           (Haskell + BHC)   targets)

Reduce noise --> Change the   -->  Remove the   -->  Redesign the
in the loop      signal            layer             machine

HOW, but         WHAT, verified    Intent to         Intent to
unambiguous      by types          execution         inference
{% end %}

The first three futures are about the intermediate layer between human intent and machine execution. The fourth future is about the machine itself. If the primary workload is inference, the machine should be designed for inference. Not adapted. Not extended. Designed.

Each transition in this timeline follows the same pattern that has repeated throughout the history of computing. When a new type of workload becomes dominant, the infrastructure eventually reshapes itself around that workload. Mainframes were redesigned for timesharing when interactive use became the dominant workload. Server hardware was redesigned for virtualization when multi-tenancy became the dominant workload. Network infrastructure was redesigned for packet switching when interactive data became more important than circuit-switched voice. The question is never whether the infrastructure will adapt. It is how long the transition takes and what it looks like on the other side.

This is admittedly the furthest out of the four possibilities. We are even further from inference-native operating systems than we are from AI generating machine code directly. The hardware support is early. The software stack is embryonic. coconutOS boots and runs a transformer forward pass, which is a start, but it is a long way from something you would deploy in production.

But the same was true of virtual memory when MIT's Project MAC implemented it in 1961. It took decades for hardware support to mature, for operating systems to build on it, for the abstraction to become invisible. Today, every program you run uses virtual memory and nobody thinks about it. The same was true of containerization when Google started using cgroups internally in 2006. Docker did not arrive until 2013. Kubernetes until 2014. The gap between "research prototype" and "runs the world" is real, but so is the trajectory.

The workloads are catching up. The hardware is catching up. The question is whether we build the OS to match, or whether we keep running inference on an operating system that thinks the CPU is in charge.

## Honest assessment

I do not know if inference-native operating systems will happen in this form. I do not know if the microkernel approach is right, or if the better path is extending Linux with GPU isolation primitives (the way cgroups extended Linux for containers, the way KVM extended Linux for virtualization). I do not know if hardware vendors will build the IOMMU support that makes per-shard GPU isolation practical at scale, or if NVIDIA will solve this problem at the driver level before anyone needs a new OS.

There are smart people working on adjacent problems. Google's TPU architecture has custom scheduling and isolation built into the hardware. AMD's ROCm is exploring open-source alternatives to CUDA's closed driver model. Intel's GPU roadmap includes hardware virtualization features. Any of these paths could make coconutOS's approach unnecessary by solving the isolation problem at a different layer.

What I do know is that running inference workloads on operating systems designed for sequential CPU programs is an impedance mismatch that will become less tolerable as inference becomes more critical. Something will change. coconutOS is my attempt to explore what that something might look like, with real code that boots on real hardware and runs a real transformer.

The code is open source, ISC-licensed, and very much a work in progress. If you are thinking about similar problems, I want to hear from you.

[github.com/coconut-os/coconutOS](https://github.com/coconut-os/coconutOS)
