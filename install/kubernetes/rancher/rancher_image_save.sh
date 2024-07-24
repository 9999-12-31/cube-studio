docker pull rancher/rke-tools:v0.1.96 && docker save rancher/rke-tools:v0.1.96 | gzip > rancher-rke-tools-v0.1.96.tar.gz &
docker pull rancher/hyperkube:v1.25.16-rancher2 && docker save rancher/hyperkube:v1.25.16-rancher2 | gzip > rancher-hyperkube-v1.25.16-rancher2.tar.gz &
docker pull rancher/shell:v0.1.24 && docker save rancher/shell:v0.1.24 | gzip > rancher-shell-v0.1.24.tar.gz &
docker pull rancher/mirrored-pause:3.7 && docker save rancher/mirrored-pause:3.7 | gzip > rancher-mirrored-pause-3.7.tar.gz &
docker pull rancher/calico-cni:v3.26.3-rancher1 && docker save rancher/calico-cni:v3.26.3-rancher1 | gzip > rancher-calico-cni-v3.26.3-rancher1.tar.gz &
docker pull rancher/mirrored-metrics-server:v0.6.2 && docker save rancher/mirrored-metrics-server:v0.6.2 | gzip > rancher-mirrored-metrics-server-v0.6.2.tar.gz &
docker pull rancher/mirrored-calico-kube-controllers:v3.26.3 && docker save rancher/mirrored-calico-kube-controllers:v3.26.3 | gzip > rancher-mirrored-calico-kube-controllers-v3.26.3.tar.gz &
docker pull rancher/mirrored-coredns-coredns:1.9.4 && docker save rancher/mirrored-coredns-coredns:1.9.4 | gzip > rancher-mirrored-coredns-coredns-1.9.4.tar.gz &
docker pull rancher/rancher-webhook:v0.4.7 && docker save rancher/rancher-webhook:v0.4.7 | gzip > rancher-rancher-webhook-v0.4.7.tar.gz &
docker pull rancher/rancher-agent:v2.8.5 && docker save rancher/rancher-agent:v2.8.5 | gzip > rancher-rancher-agent-v2.8.5.tar.gz &
docker pull rancher/mirrored-flannelcni-flannel:v0.19.2 && docker save rancher/mirrored-flannelcni-flannel:v0.19.2 | gzip > rancher-mirrored-flannelcni-flannel-v0.19.2.tar.gz &
docker pull rancher/rancher:v2.8.5 && docker save rancher/rancher:v2.8.5 | gzip > rancher-rancher-v2.8.5.tar.gz &
docker pull rancher/mirrored-coreos-etcd:v3.5.9 && docker save rancher/mirrored-coreos-etcd:v3.5.9 | gzip > rancher-mirrored-coreos-etcd-v3.5.9.tar.gz &
docker pull rancher/mirrored-calico-node:v3.26.3 && docker save rancher/mirrored-calico-node:v3.26.3 | gzip > rancher-mirrored-calico-node-v3.26.3.tar.gz &
docker pull rancher/kube-api-auth:v0.2.1 && docker save rancher/kube-api-auth:v0.2.1 | gzip > rancher-kube-api-auth-v0.2.1.tar.gz &
docker pull rancher/mirrored-cluster-proportional-autoscaler:1.8.6 && docker save rancher/mirrored-cluster-proportional-autoscaler:1.8.6 | gzip > rancher-mirrored-cluster-proportional-autoscaler-1.8.6.tar.gz &

wait
