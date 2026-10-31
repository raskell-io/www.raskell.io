+++
title = "A prediction wrapped in a promise"
date = 2026-11-14
draft = true
description = "An insurance policy is a prediction about the world, wrapped in a contract that promises what happens if it goes wrong for you. That is a data product."

[taxonomies]
tags = ["insurance", "machine-learning", "trust"]
+++

Look at an insurance policy as an engineer would and it has two parts. Inside is a prediction: how likely this house is to burn, this car to crash, this person to live past eighty, and what it would cost. Around it is a promise: if the bad outcome happens to you, the insurer pays. The price connects the two, and the whole craft of the business is making the prediction good enough that the price holds across thousands of customers, which is the law of large numbers doing its job.

It has looked like this since Edmond Halley built a life table from the birth and death records of Breslau in 1693 and used it to price annuities: a dataset, a model fitted to it, and a price derived from the model. Underwriting, pricing, reserving and reinsurance are all versions of the same thing. That is why I called insurers [the original data company](/articles/the-original-data-company/). The balance sheet makes the promise credible; the model is what is actually being sold.
