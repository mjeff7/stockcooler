#!/bin/bash

git checkout joined && git reset --hard subApp && git merge --allow --no-edit servermaster && git merge --allow --no-edit clientmaster
