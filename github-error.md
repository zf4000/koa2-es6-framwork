# github 无法 pull push 的问题排查和解决

突然发现无法 git pull,push 了,报错如下:

```sh
ssh: connect to host github.com port 22: connection timed out
```

## 原因

翻墙代理导致,需要指定 git 走本地的 v2rayN 代理端口(10808)

## 步骤

1. 打开 gitbash
2. cd ~/.ssh
3. vim ./config

```sh
#设置git走v2ray代理,
ProxyCommand connect -S 127.0.0.1:10808 -a none %h %p

Host github.com
  User git
  Port 22
  Hostname github.com
  # 注意修改路径为你的路径
  IdentityFile "C:\Users\Administrator\.ssh\id_rsa"
  TCPKeepAlive yes

Host ssh.github.com
  User git
  Port 443
  Hostname ssh.github.com
  # 注意修改路径为你的路径
  IdentityFile "C:\Users\Administrator\.ssh\id_rsa"
  TCPKeepAlive yes

```

1. 测试是否正常

```sh
ssh -T git@github.com
#如果显示:Hi zf4000! You've successfully authenticated, but GitHub does not provide shell access. 表示正常
```
