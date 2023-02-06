---
title: "My OpenBSD journey: Getting it virtualized with libvirt (1)"
author: "Raffael"
date: "2023-02-06"
description: "My OpenBSD journey: Getting it virtualized with libvirt (1)"
tags:
- openbsd, virtualization
categories:
- foss
---

![openbsd-libvirt.png](openbsd-libvirt.png)

## Void Linux as my daily driver

Around six months ago, I decided to ditch my long in the tooth Arch-based setup on my belovest Thinkpad X1 Carbon. I've been very loyal over the years, and almost came to belive that Arch will be a constant in my adult life. While I kept up with upcoming technologies, I somehow lost track of the ever so diversifying landscape of Linux distributions. It took me a while of constantly coming across a generically named reference to what seemed to be yet another Linux distribution. That outwardly generic sounding name, [Void Linux](https://voidlinux.org/), kept poking my curiosity by supposedly feeling like Arch Linux in the old days, while sharing some substantial DNA with the BSD operating systems. Yet, that's another story I might tell another day, but to remain brief, the BSDs, in particular the infamous OpenBSD with its quite infamous lead developer Theo De Raadt, always were what I considered the endgame. The holy grail of Unix operating systems, so did I think over the decades, FreeBSD, NetBSD and OpenBSD, have always been on my personal radar and I felt I had to earn the intellectual capacity to be able to properly put them at use one day. Last year, when I made the (almost painless) switch from Arch Linux to Void Linux, the simplicity and especially the barebone experience of Void reignited the fascination and the admiration I always had for the BSD operating systems and their philosophy.

While I could write (and definitely will in the near future) about how my journey onto Void Linux and how it has been so far, I preferred to write down, in some like diary, and document every step on how one can approach and ultimately use [OpenBSD](https://www.openbsd.org/) in 2023. Big disclaimer, I've yet to install OpenBSD on some baremetal server I ordered some days ago, but dabbled around in the meantime with OS-level virtualization in order to get it running. That's what brings me to _libvirt_ and my surprise to learn that I wouldn't need some full-fledged virtualization solution like the ones offered by VirtualBox or VMWare to efficiently run a virtualized OpenBSD machine. So, ok, let's recap, so far we got the following bill of materials:

- Void Linux as the host system
- OpenBSD to be virtualized on that host system
- libvirt as the glue that makes virtualization feel like black magic

### From Void to OpenBSD

Before I tell you more about the history of how things went down while setting up OpenBSD, let me give you some basic notions about both Void Linux, being one out of many Linux distributions for the sake of simplicity representing them all as it ended up being my distribution of choice, and OpenBSD. As already mentioned earlier, Void Linux and OpenBSD are both Unix-like operating systems, but they feature enough differences to make them noteworthy. Here are a few similarities and differences between the two:

What is similar:

- Both are free and open-source operating systems.
- Both use a package manager for software management. Void Linux uses XBPS, while OpenBSD uses pkg_add.
- Both prioritize security and stability in their development and design.
- Both feature a version control based package repository, meaning that changes in build definition are managed by pull requests from users.

What is different:

- License: Void Linux is licensed under the MIT License, while OpenBSD is licensed under the ISC License.
- Philosophy: OpenBSD prioritizes security and privacy, while Void Linux prioritizes simplicity and modularity.
- Package Management: Void Linux uses a binary package manager (XBPS), while OpenBSD uses a source-based package manager (pkg_add).
- Package Repository: Void Linux has a large and diverse repository, while OpenBSD has a smaller and more curated repository.
- Init System: Void Linux uses runit as its init system, while OpenBSD uses rc. None uses the infamous systemd init system.

## What is OpenBSD in a nutshell

OpenBSD is a free and open-source operating system that focuses on security, standardization, and robustness. It is based on the Berkeley Software Distribution (BSD) Unix operating system and is developed by a global community of volunteers. OpenBSD aims to provide a secure platform for both personal and enterprise use by implementing strong security features, including access control mechanisms, encryption, and auditing.

[Theo de Raadt](https://en.wikipedia.org/wiki/Theo_de_Raadt) is the founder and lead developer of OpenBSD. His main objective with OpenBSD is to create a secure operating system that is free from backdoors, vulnerabilities, and other security weaknesses. He is committed to auditing the source code of the operating system and third-party software included with it, to identify and remove any potential security risks. De Raadt is also dedicated to improving the overall quality of the codebase and ensuring compatibility with a wide range of hardware and software. 

What makes OpenBSD really special and stand out is that is developed a suite of tools that got adopted by other OSs like Linux, macOS or even Windows. One of the most famous instances of such adoption is the now de facto standard openssh suite. It actually emerged from within the development circle of the OpenBSD project. OpenBSD also implemented a wide range of OS features that are by now considered staples among other OSs, things like Linux-based OS-level containerization done via the means of cgroups, something that OpenBSD already pioneered and solved with a different spin many years before Linux with pledge and unveil. Go check out [Why OpenBSD rocks](https://why-openbsd.rocks/fact/freezero/) to get a feel what makes OpenBSD so unique and interesting.

### Virtualization with libvirt

So now, let's get back to our virtualization endeavour where we would like to virtualize OpenBSD on a Void Linux installation. If you happen to be using another Linux distribution, most of the individual steps would be very similar. That brings me to the next technology we should explain a bit more here, and that is libvirt.

[libvirt](https://libvirt.org/) is an open-source virtualization management library that provides a simple and unified API for managing virtualization technologies, including KVM, QEMU, Xen, and others. It aims to simplify the process of creating, managing, and migrating virtual machines, storage, and networks, and to make it easier for administrators to manage virtual environments.

To virtualize an operating system like OpenBSD with libvirt, you need to follow these steps:

1. Install libvirt and the virtualization technology you want to use, such as KVM.
2. Download the OpenBSD iso file and place it in a location accessible by libvirt.
3. Create a new virtual machine in libvirt with the OpenBSD ISO as the installation media. This can be done through the command line or using a graphical user interface such as virt-manager.
4. Configure the virtual machine, including the amount of memory, CPU, and disk space, to meet the requirements of OpenBSD.
5. Start the virtual machine and install OpenBSD as you would on a physical machine.
6. Once the installation is complete, you can configure the virtual network, storage, and other settings as required.
7. Finally, you can use the libvirt API or the command line to manage and control the virtual machine, including starting, stopping, migrating, and snapshotting.

### Step-by-step guide

Let's first install the `libvirt` package and some related packages which we need in order to connect via VNC. The VNC will provide us with the possibility to use the graphical interface of the running OpenBSD instance.

```bash
$ sudo xbps-install -S dbus qemu libvirt virt-manager virt-viewer tigervnc
```

Now, we need to add our user, in my case `raskell`, to the `libvirt` group which got simultanously created with the installation of libvirt.

```bash
$ sudo usermod -aG libvirt raskell
```

OpenBSD features a release cycle of six months. We would need to update our system every six month to keep up with the latest packages. During a given release, only security and bug fix patches are applied to the curated packages maintained by pkg_add. Therefore, in February 2023, we're using the [OpenBSD 7.2](https://www.openbsd.org/72.html) release version. As I'm living in Switzerland, I chose to pull the iso image from a Swiss mirror, in this case from [`mirror.ungleich.ch/pub/OpenBSD`](https://mirror.ungleich.ch/pub/OpenBSD/7.2/) (check what mirror is closest to you to get the best download rate).

```bash
# cd /var/lib/libvirt/boot/
# sudo wget https://mirror.ungleich.ch/pub/OpenBSD/7.2/amd64/install72.iso
--2023-01-12 20:48:15--  https://mirror.ungleich.ch/pub/OpenBSD/7.2/amd64/install72.iso
Resolving mirror.ungleich.ch (mirror.ungleich.ch)... 2a0a:e5c0:2:2:400:c8ff:fe68:bef3, 185.203.114.135
Connecting to mirror.ungleich.ch (mirror.ungleich.ch)|2a0a:e5c0:2:2:400:c8ff:fe68:bef3|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 583352320 (556M) [application/octet-stream]
Saving to: ‘install72.iso.1’

install72.iso.1                      100%[====================================================================>] 556.33M  7.11MB/s    in 77s     

2023-01-12 20:49:33 (7.19 MB/s) - ‘install72.iso.1’ saved [583352320/583352320]
sudo wget https://mirror.ungleich.ch/pub/OpenBSD/7.2/amd64/SHA256
--2023-01-12 20:47:38--  https://mirror.ungleich.ch/pub/OpenBSD/7.2/amd64/SHA256
Resolving mirror.ungleich.ch (mirror.ungleich.ch)... 2a0a:e5c0:2:2:400:c8ff:fe68:bef3, 185.203.114.135
Connecting to mirror.ungleich.ch (mirror.ungleich.ch)|2a0a:e5c0:2:2:400:c8ff:fe68:bef3|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1992 (1.9K) [application/octet-stream]
Saving to: ‘SHA256.1’

SHA256.1                             100%[====================================================================>]   1.95K  --.-KB/s    in 0s      

2023-01-12 20:47:39 (742 MB/s) - ‘SHA256.1’ saved [1992/1992]
# grep install63.iso SHA256 > /tmp/x
# sha256sum -c /tmp/x
# rm /tmp/x
```

Before we can start the virtualization server and get running our OpenBSD instance, we need to define the configuraiton on how to virtualize and ultimately boot the system with. This is done with `virt-install`. Noteworthy here is that we [QEMU](https://www.qemu.org/) as our emulation solution of choice, we allocate up to 4GB of RAM and 4 CPU cores to the machine.

```bash
$ sudo virt-install \
      --name=openbsd \
      --virt-type=qemu \
      --memory=2048,maxmemory=4096 \
      --vcpus=2,maxvcpus=4 \
      --cpu host \
      --os-variant=openbsd7.0 \
      --cdrom=/var/lib/libvirt/boot/install72.iso \
      --network=bridge=virbr0,model=virtio \
      --graphics=vnc \
      --disk path=/var/lib/libvirt/images/openbsd.qcow2,size=40,bus=virtio,format=qcow2
```

Once, it is up and running, we can use a vnc solution to connect to the running machine. In this case, I chose [virsh](https://www.libvirt.org/manpages/virsh.html) to do the job. virsh is a command-line interface tool for managing virtualization environments created with libvirt. It allows us to manage virtual machines, storage pools, and network interfaces, as well as other virtualization components, from the command line.

To establish a VNC connection with a running libvirt virtualized OpenBSD instance, you can use the following steps:

1. Start the virtual machine in libvirt: You can start the virtual machine using the virsh command **`virsh start <vm-name>`**, where **`<vm-name>`** is the name of the virtual machine you want to start.
2. Find the VNC display: Once the virtual machine is running, you can find the VNC display number for the virtual machine using the virsh command **`virsh vncdisplay <vm-name>`**.
3. Connect to the VNC display: You can connect to the VNC display using a VNC client, such as **`vncviewer`**, and specify the IP address of the host running the virtual machine and the VNC display number. For example, if the host's IP address is **`192.168.0.100`** and the VNC display number is **`:0`**, the command to connect would be **`vncviewer 192.168.0.100:0`**.
4. Authenticate to the VNC server: You may need to enter a password to authenticate to the VNC server. The password is set when the virtual machine is created in libvirt.

With these steps, you can establish a VNC connection with a running libvirt virtualized OpenBSD instance and interact with the virtual machine's graphical user interface.

```bash
$ virsh dumpxml openbsd | grep vnc
<graphics type='vnc' port='5900' autoport='yes' listen='127.0.0.1'>
```

Like I did, most of you would like to interact with a graphical interface such as with X11. For that, we yet another tool, a so-called VNC viewer. A very simple implementation of such a vnc viewer is [tigervnc](https://tigervnc.org/) (simply install it with `$ sudo xbps-install -S tigervnc`).

```bash
$ sudo virsh --connect
qemu:///system start openbsd
Domain 'openbsd' started
```

{tbc}

## References and further reading

- [[Guide] how to setup QEMU/KVM emulation on void linux | /r/voidlinux](https://www.reddit.com/r/voidlinux/comments/ghwvv5/guide_how_to_setup_qemukvm_emulation_on_void_linux/)
- [KVM virt-install: Install OpenBSD As Guest Operating System](https://www.cyberciti.biz/faq/kvmvirtualization-virt-install-openbsd-unix-guest/)
- [Auto-install OpenBSD on QEMU | skreutz.com](https://www.skreutz.com/posts/autoinstall-openbsd-on-qemu/)
