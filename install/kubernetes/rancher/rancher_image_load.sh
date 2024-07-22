gunzip -c rancher-rke-tools-v0.1.96.tar.gz | docker load &
gunzip -c rancher-hyperkube-v1.25.16-rancher2.tar.gz | docker load &
gunzip -c rancher-shell-v0.1.24.tar.gz | docker load &
gunzip -c rancher-mirrored-pause-3.7.tar.gz | docker load &
gunzip -c rancher-calico-cni-v3.26.3-rancher1.tar.gz | docker load &
gunzip -c rancher-mirrored-metrics-server-v0.6.2.tar.gz | docker load &
gunzip -c rancher-mirrored-calico-kube-controllers-v3.26.3.tar.gz | docker load &
gunzip -c rancher-mirrored-coredns-coredns-1.9.4.tar.gz | docker load &
gunzip -c rancher-rancher-webhook-v0.4.7.tar.gz | docker load &
gunzip -c rancher-rancher-agent-v2.8.5.tar.gz | docker load &
gunzip -c rancher-mirrored-flannelcni-flannel-v0.19.2.tar.gz | docker load &
gunzip -c rancher-rancher-v2.8.5.tar.gz | docker load &
gunzip -c rancher-mirrored-coreos-etcd-v3.5.9.tar.gz | docker load &
gunzip -c rancher-mirrored-calico-node-v3.26.3.tar.gz | docker load &
gunzip -c rancher-kube-api-auth-v0.2.1.tar.gz | docker load &
gunzip -c rancher-mirrored-cluster-proportional-autoscaler-1.8.6.tar.gz | docker load &

wait
