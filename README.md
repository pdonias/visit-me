# Veasit

## Add a feature from a branch

```sh
$ git checkout release
$ git pull --ff-only
$ git checkout my-branch
$ git rebase release # + resolve conflicts
$ git push --set-upstream origin my-branch
```

On Github:
- Create a Pull Request with `base: release` and `compare: my-branch`
- [ Commit and push as many other changes as needed ]
- `squash merge` the Pull Request (to keep only one commit) or `rebase merge` it (to keep all the commits)

## Release a new version

```sh
$ git checkout release
$ git pull --ff-only
$ git checkout master
$ git pull --ff-only
$ git merge release
$ git push
```
