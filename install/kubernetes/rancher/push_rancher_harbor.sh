docker login harbor.bigdata.com
docker pull rancher/rke-tools:v0.1.96 && docker tag rancher/rke-tools:v0.1.96 harbor.bigdata.com/rancher/rke-tools:v0.1.96 && docker push harbor.bigdata.com/rancher/rke-tools:v0.1.96 &
docker pull rancher/hyperkube:v1.25.16-rancher2 && docker tag rancher/hyperkube:v1.25.16-rancher2 harbor.bigdata.com/rancher/hyperkube:v1.25.16-rancher2 && docker push harbor.bigdata.com/rancher/hyperkube:v1.25.16-rancher2 &
docker pull rancher/shell:v0.1.24 && docker tag rancher/shell:v0.1.24 harbor.bigdata.com/rancher/shell:v0.1.24 && docker push harbor.bigdata.com/rancher/shell:v0.1.24 &
docker pull rancher/mirrored-pause:3.7 && docker tag rancher/mirrored-pause:3.7 harbor.bigdata.com/rancher/mirrored-pause:3.7 && docker push harbor.bigdata.com/rancher/mirrored-pause:3.7 &
docker pull rancher/calico-cni:v3.26.3-rancher1 && docker tag rancher/calico-cni:v3.26.3-rancher1 harbor.bigdata.com/rancher/calico-cni:v3.26.3-rancher1 && docker push harbor.bigdata.com/rancher/calico-cni:v3.26.3-rancher1 &
docker pull rancher/mirrored-metrics-server:v0.6.2 && docker tag rancher/mirrored-metrics-server:v0.6.2 harbor.bigdata.com/rancher/mirrored-metrics-server:v0.6.2 && docker push harbor.bigdata.com/rancher/mirrored-metrics-server:v0.6.2 &
docker pull rancher/mirrored-calico-kube-controllers:v3.26.3 && docker tag rancher/mirrored-calico-kube-controllers:v3.26.3 harbor.bigdata.com/rancher/mirrored-calico-kube-controllers:v3.26.3 && docker push harbor.bigdata.com/rancher/mirrored-calico-kube-controllers:v3.26.3 &
docker pull rancher/mirrored-coredns-coredns:1.9.4 && docker tag rancher/mirrored-coredns-coredns:1.9.4 harbor.bigdata.com/rancher/mirrored-coredns-coredns:1.9.4 && docker push harbor.bigdata.com/rancher/mirrored-coredns-coredns:1.9.4 &
docker pull rancher/rancher-webhook:v0.4.7 && docker tag rancher/rancher-webhook:v0.4.7 harbor.bigdata.com/rancher/rancher-webhook:v0.4.7 && docker push harbor.bigdata.com/rancher/rancher-webhook:v0.4.7 &
docker pull rancher/rancher-agent:v2.8.5 && docker tag rancher/rancher-agent:v2.8.5 harbor.bigdata.com/rancher/rancher-agent:v2.8.5 && docker push harbor.bigdata.com/rancher/rancher-agent:v2.8.5 &
docker pull rancher/mirrored-flannelcni-flannel:v0.19.2 && docker tag rancher/mirrored-flannelcni-flannel:v0.19.2 harbor.bigdata.com/rancher/mirrored-flannelcni-flannel:v0.19.2 && docker push harbor.bigdata.com/rancher/mirrored-flannelcni-flannel:v0.19.2 &
docker pull rancher/rancher:v2.8.5 && docker tag rancher/rancher:v2.8.5 harbor.bigdata.com/rancher/rancher:v2.8.5 && docker push harbor.bigdata.com/rancher/rancher:v2.8.5 &
docker pull rancher/mirrored-coreos-etcd:v3.5.9 && docker tag rancher/mirrored-coreos-etcd:v3.5.9 harbor.bigdata.com/rancher/mirrored-coreos-etcd:v3.5.9 && docker push harbor.bigdata.com/rancher/mirrored-coreos-etcd:v3.5.9 &
docker pull rancher/mirrored-calico-node:v3.26.3 && docker tag rancher/mirrored-calico-node:v3.26.3 harbor.bigdata.com/rancher/mirrored-calico-node:v3.26.3 && docker push harbor.bigdata.com/rancher/mirrored-calico-node:v3.26.3 &
docker pull rancher/kube-api-auth:v0.2.1 && docker tag rancher/kube-api-auth:v0.2.1 harbor.bigdata.com/rancher/kube-api-auth:v0.2.1 && docker push harbor.bigdata.com/rancher/kube-api-auth:v0.2.1 &
docker pull rancher/mirrored-cluster-proportional-autoscaler:1.8.6 && docker tag rancher/mirrored-cluster-proportional-autoscaler:1.8.6 harbor.bigdata.com/rancher/mirrored-cluster-proportional-autoscaler:1.8.6 && docker push harbor.bigdata.com/rancher/mirrored-cluster-proportional-autoscaler:1.8.6 &

wait
