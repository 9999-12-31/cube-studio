#构建前端
docker build -t harbor.bigdata.com/cube-studio/kubeflow-dashboard-frontend:2024.07.01 -f install/docker/dockerFrontend/Dockerfile .
docker push harbor.bigdata.com/cube-studio/kubeflow-dashboard-frontend:2024.07.01
#构建后端
docker build -t harbor.bigdata.com/cube-studio/kubeflow-dashboard:2024.07.01 -f install/docker/Dockerfile .
docker push harbor.bigdata.com/cube-studio/kubeflow-dashboard:2024.07.01