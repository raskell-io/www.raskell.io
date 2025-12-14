+++
title = "Disk space maintenance on Void Linux"
date = 2024-05-01
description = "What to do when disk space is full after not paying attention after many months if not years of using Void Linux."

[extra]
author = "Raffael"
katex = true
image = "void-disk-usage.png"
+++

## Monday morning surprise

As I spent most time doing stuff with my computer rather than configuring my beloved Linux distribution, Void Linux, I have developed the tendency to not really bother about Void at all until something crucial becomes unusable. After almost two years of having switched from Arch to Void, I have actually never encountered any major problem and felt I had made the right decision.

I checked my disk usage out of curiosity if the 250GB solid-state disk would be enough. And there came the surprise:

```shell
$ df -H
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs        8.4G     0  8.4G   0% /dev
tmpfs           8.4G  1.9M  8.4G   1% /dev/shm
tmpfs           8.4G  1.4M  8.4G   1% /run
/dev/nvme0n1p3  138G  117G   21G  85% /
efivarfs        158k   85k   69k  56% /sys/firmware/efi/efivars
cgroup          8.4G     0  8.4G   0% /sys/fs/cgroup
/dev/nvme0n1p4  366G   34G  332G  10% /home
/dev/nvme0n1p1  536M  152k  536M   1% /boot/efi
tmpfs           8.4G   25k  8.4G   1% /tmp
```

My root partition was full, way too full in my opinion. Did I miss something? Is Void not what I was looking for after all? I don't enjoy baby sitting my OS _du jour_.

## The painless solution

After a quick Brave search, I ended up finding what I was looking for. Some kind fellow software engineer from China didn't shy away to make a blog post about his journey when he faced the very same problem. Out of annoyance of having to deal with that, I copy-pasted as quickly as possible, not minding what kind of side-effects I might run into, these three commands.

### 1. Cleaning the package cache

All the knowledge I was lacking was to be found with the man page of `xbps-remove`.

```shell
# xbps-remove -yO
```

The [man page](https://man.voidlinux.org/xbps-remove.1#O,) of `xbps-remove` tells us the `-O` parameter takes care of _cleaning the cache directory removing obsolete binary packages._ Obsolete binary packages? Good riddance! I was surprised this to learn that solely this step freed up almost half of my used root partition disk space.

### 2. Removing orphaned packages

```shell
# xbps-remove -yo
```

Here the same [man page](https://man.voidlinux.org/xbps-remove.1#o,) tells us that the `-o` parameter takes care of _removing installed package orphans that were installed automatically (as dependencies) and are not currently dependencies of any installed package._ As before, good riddance!

### 3. Purging old, unused kernels 

This one is interesting. While I knew about the circumstance that the people behind Void had developed their own package management ecosystem, I hadn't fully realized there were other utilities that came along with the upstream Void installation which were there for me to manage my beloved OS. So, apparently, one of these is a [shell script](https://github.com/void-linux/void-packages/blob/master/srcpkgs/base-files/files/vkpurge) name `vkpurge`, I must assume as a short name for `Void's Kernel purging` tool. I like this type of naming heavily implying its functionality.

```shell
# vkpurge rm all
```

It performed as expected. Old kernel files (and modules?) were indeed purged and freed up even more disk space. I should add that this step is optional as it is always useful to have some old kernels at hand when things hit the fan (which for me, they haven't in a very, very long time).

## Result

I couldn't be happier.

```shell
$ df -H
Filesystem      Size  Used Avail Use% Mounted on
...
/dev/nvme0n1p3  138G   45G   93G  33% /
...
```

## Renewal of faith

Overall, why am I even writing this if some other fellow engineer already figured this out? Simply, because I would therefore be able to explain why I have enjoyed my journey with Void as my go-to Linux distribution. It keeps things simple. Some well-documented utilities. As simple that a simple Brave search suffices to find the answer to my problems.

This very aspect of Void is worthwhile highlighing. I remember more arcane Linux distributions that had me in their grip in figuring things out. Many Googles searches were necessary and even more trial and errors attempts to get simple things fixed.

Now back to my Monday morning.

---

[^1]: Painting in header image is "Seaside" by Aleksandr Deyneka
