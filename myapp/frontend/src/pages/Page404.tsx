import { Button } from 'antd'
import React from 'react'
import { IAppMenuItem } from '../api/interface/kubeflowInterface'
import {
  CloseCircleFilled
} from '@ant-design/icons';
export default function Page404() {
    return (
        <div className="d-f jc ac h100 fade-in">
            <div className="ta-c">
                {/*<div><img className="w512" src={require('../images/workData.png')} alt=""/></div>*/}
              <CloseCircleFilled   style={{ fontSize: '30px', color: 'red' }}/>
                {/* <div>
                    <img className="pb32 w256" src={require('../images/cube-studio.svg').default} alt="" />
                </div> */}
                <div className="fs16">Please back and retry</div>
            </div>
        </div>
    )
}
