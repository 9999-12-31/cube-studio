docker login harbor.bigdata.com
docker pull harbor.bigdata.com/rancher/mirrored-calico-kube-controllers:v3.26.3 && docker tag harbor.bigdata.com/rancher/mirrored-calico-kube-controllers:v3.26.3 rancher/mirrored-calico-kube-controllers:v3.26.3 &
docker pull harbor.bigdata.com/rancher/mirrored-calico-node:v3.26.3 && docker tag harbor.bigdata.com/rancher/mirrored-calico-node:v3.26.3 rancher/mirrored-calico-node:v3.26.3 &
docker pull harbor.bigdata.com/rancher/mirrored-flannelcni-flannel:v0.19.2 && docker tag harbor.bigdata.com/rancher/mirrored-flannelcni-flannel:v0.19.2 rancher/mirrored-flannelcni-flannel:v0.19.2 &
docker pull harbor.bigdata.com/rancher/rancher:v2.8.5 && docker tag harbor.bigdata.com/rancher/rancher:v2.8.5 rancher/rancher:v2.8.5 &
docker pull harbor.bigdata.com/rancher/rancher-agent:v2.8.5 && docker tag harbor.bigdata.com/rancher/rancher-agent:v2.8.5 rancher/rancher-agent:v2.8.5 &
docker pull harbor.bigdata.com/rancher/mirrored-cluster-proportional-autoscaler:1.8.6 && docker tag harbor.bigdata.com/rancher/mirrored-cluster-proportional-autoscaler:1.8.6 rancher/mirrored-cluster-proportional-autoscaler:1.8.6 &
docker pull harbor.bigdata.com/rancher/mirrored-pause:3.7 && docker tag harbor.bigdata.com/rancher/mirrored-pause:3.7 rancher/mirrored-pause:3.7 &
docker pull harbor.bigdata.com/rancher/hyperkube:v1.25.16-rancher2 && docker tag harbor.bigdata.com/rancher/hyperkube:v1.25.16-rancher2 rancher/hyperkube:v1.25.16-rancher2 &
docker pull harbor.bigdata.com/rancher/calico-cni:v3.26.3-rancher1 && docker tag harbor.bigdata.com/rancher/calico-cni:v3.26.3-rancher1 rancher/calico-cni:v3.26.3-rancher1 &
docker pull harbor.bigdata.com/rancher/shell:v0.1.24 && docker tag harbor.bigdata.com/rancher/shell:v0.1.24 rancher/shell:v0.1.24 &
docker pull harbor.bigdata.com/rancher/kube-api-auth:v0.2.1 && docker tag harbor.bigdata.com/rancher/kube-api-auth:v0.2.1 rancher/kube-api-auth:v0.2.1 &
docker pull harbor.bigdata.com/rancher/rke-tools:v0.1.96 && docker tag harbor.bigdata.com/rancher/rke-tools:v0.1.96 rancher/rke-tools:v0.1.96 &
docker pull harbor.bigdata.com/rancher/mirrored-coredns-coredns:1.9.4 && docker tag harbor.bigdata.com/rancher/mirrored-coredns-coredns:1.9.4 rancher/mirrored-coredns-coredns:1.9.4 &
docker pull harbor.bigdata.com/rancher/mirrored-coreos-etcd:v3.5.9 && docker tag harbor.bigdata.com/rancher/mirrored-coreos-etcd:v3.5.9 rancher/mirrored-coreos-etcd:v3.5.9 &
docker pull harbor.bigdata.com/rancher/mirrored-metrics-server:v0.6.2 && docker tag harbor.bigdata.com/rancher/mirrored-metrics-server:v0.6.2 rancher/mirrored-metrics-server:v0.6.2 &
docker pull harbor.bigdata.com/rancher/rancher-webhook:v0.4.7 && docker tag harbor.bigdata.com/rancher/rancher-webhook:v0.4.7 rancher/rancher-webhook:v0.4.7 &

wait
