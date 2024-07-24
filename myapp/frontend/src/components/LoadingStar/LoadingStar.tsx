import React from 'react'
// import globalConfig from '../../global.config';
import './LoadingStar.less';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export default function LoadingStar() {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    )
}
