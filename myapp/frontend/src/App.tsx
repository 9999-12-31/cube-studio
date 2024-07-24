import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Routers,
  useRoutes,
  useNavigate,
  useLocation,
  RouteObject
} from "react-router-dom";

import { Drawer, Dropdown, Menu, Select, Spin, Tag } from 'antd';
import { IRouterConfigPlusItem } from './api/interface/baseInterface';
import { formatRoute, getDefaultOpenKeys, routerConfigPlus } from './routerConfig';
import SubMenu from 'antd/lib/menu/SubMenu';
import { clearWaterNow, drawWater, drawWaterNow, getParam, obj2UrlParam, parseParam2Obj } from './util'
import { getAppHeaderConfig, getAppMenu, getCustomDialog, userLogout } from './api/kubeflowApi';
import { IAppHeaderItem, IAppMenuItem, ICustomDialog } from './api/interface/kubeflowInterface';
import { AppstoreOutlined, DownOutlined, LeftOutlined, RightOutlined, TranslationOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie'
import { handleTips } from './api';
import globalConfig from './global.config'
import i18nEn from './images/i18nEn.svg';

import { useTranslation, Trans, } from 'react-i18next';
const userName = Cookies.get('myapp_username')

const RouterConfig = (config: RouteObject[]) => {
  let element = useRoutes(config);
  return element;
}

document.title = '医疗模型训练平台'
const getRouterMap = (routerList: IRouterConfigPlusItem[]): Record<string, IRouterConfigPlusItem> => {
  const res: Record<string, IRouterConfigPlusItem> = {}
  const queue = [...routerList]
  while (queue.length) {
    const item = queue.shift()
    if (item) {
      res[item?.path || ''] = item
      if (item?.children && item.children.length) {
        queue.push(...item.children)
      }
    }
  }
  return res
}

const getValidAppList = (config: IRouterConfigPlusItem[]) => config.filter(item => !!item.name && !item.hidden)

interface IProps { }

const AppWrapper = (props: IProps) => {
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [currentNavList, setCurrentNavList] = useState<IRouterConfigPlusItem[]>([])
  const [sourceAppList, setSourceAppList] = useState<IRouterConfigPlusItem[]>([])
  const [sourceAppMap, setSourceAppMap] = useState<Record<string, IRouterConfigPlusItem>>({})
  const [CurrentRouteComponent, setCurrentRouteComponent] = useState<any>()
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false)
  const [isShowSlideMenu, setIsShowSlideMenu] = useState(true)
  const [imgUrlProtraits, setImgUrlProtraits] = useState('')
  const [customDialogVisable, setCustomDialogVisable] = useState(false)
  const [customDialogInfo, setCustomDialogInfo] = useState<ICustomDialog>()
  const [headerConfig, setHeaderConfig] = useState<IAppHeaderItem[]>([])
  const [navSelected, setNavSelected] = useState<string[]>([])
  const isShowNav = getParam('isShowNav')

  const navigate = useNavigate();
  const location = useLocation()

  const { t, i18n } = useTranslation();

  useEffect(() => {
    getAppMenu().then(res => {
      const remoteRoute = res.data
      const dynamicRoute = formatRoute([...remoteRoute])
      const tarRoute = [...dynamicRoute, ...routerConfigPlus]
      const tarRouteMap = getRouterMap(tarRoute)

      setSourceAppList(tarRoute)
      setSourceAppMap(tarRouteMap)

      const defaultOpenKeys = getDefaultOpenKeys(tarRoute)
      setOpenKeys(defaultOpenKeys)

      setCurrentRouteComponent(() => () => RouterConfig(tarRoute as RouteObject[]))
    }).catch(err => { })

    // getAppHeaderConfig().then(res => {
    //   const config = res.data
    //   setHeaderConfig(config)
    // }).catch(err => { })
  }, [])

  useEffect(() => {
    if (sourceAppList.length && Object.keys(sourceAppMap).length) {
      const { pathname } = location
      if (pathname === '/') {
        clearWaterNow()
      } else {
        drawWaterNow()
      }
      handleCurrentRoute(sourceAppMap, getValidAppList(sourceAppList))
    }
  }, [location, sourceAppList, sourceAppMap])

  useEffect(() => {
    const controller = new AbortController()
    const url = encodeURIComponent(location.pathname)
    getCustomDialog(url, controller.signal).then(res => {
      setCustomDialogInfo(res.data)
      setCustomDialogVisable(res.data.hit)
    }).catch(err => {
      console.log(err);
    })
    return () => {
      controller.abort()
    }
  }, [location])

  const handleCurrentRoute = (appMap: Record<string, IRouterConfigPlusItem>, appList: IRouterConfigPlusItem[]) => {
    const { pathname } = location
    const [_, stLevel, edLevel] = pathname.split('/')
    const stLevelApp = appMap[`/${stLevel}`]
    let currentNavKey = ""
    if (stLevelApp && stLevelApp.isSingleModule) {
      currentNavKey = `/${stLevel}/${edLevel}`
    } else {
      currentNavKey = `/${stLevel}`
    }

    let topNavAppList = appList
    if (stLevelApp && stLevelApp.isSingleModule) {
      topNavAppList = stLevelApp.children || []
    }

    setCurrentNavList(topNavAppList)
    setNavSelected([currentNavKey])
    setIsShowSlideMenu(stLevelApp && !stLevelApp.isCollapsed)
  }

  const handleClickNav = (app: IRouterConfigPlusItem, subPath?: string) => {
    if (app.path === '/') {
      navigate(app.path || '/')
    } else if (app.menu_type === 'iframe' && app.path) {
      navigate(app.path)
    } else if (app.menu_type === 'out_link' && app.url) {
      window.open(app.url, 'blank')
    } else if (app.menu_type === 'in_link' && app.path) {
      window.open(app.url, 'blank')
    } else {
      const currentApp = sourceAppMap[subPath || '']
      let currentItem = subPath ? currentApp : app

      while (currentItem && currentItem.children) {
        currentItem = currentItem.children[0]
      }

      if (currentItem) {
        let appMenuPath = currentItem.path || ''
        navigate(appMenuPath)
      }
    }
  }

  const renderMenu = () => {
    const { pathname } = location
    const currentNavMap = sourceAppMap
    const [currentSelected] = navSelected

    if (currentNavMap && currentSelected && currentNavMap[currentSelected]?.children?.length) {

      const currentAppMenu = currentNavMap[currentSelected].children
      if (currentAppMenu && currentAppMenu.length) {

        const menuContent = currentAppMenu.map(menu => {
          if (menu.isMenu) {
            return <SubMenu key={menu.path} title={menu.title}>
              {
                menu.children?.map(sub => {
                  if (sub.isMenu) {
                    return <Menu.ItemGroup key={sub.path} title={sub.title}>
                      {
                        sub.children?.map(thr => {
                          return <Menu.Item disabled={!!thr.disable} hidden={!!thr.hidden} key={thr.path} onClick={() => {
                            if (!menu.isCollapsed) {
                              setIsMenuCollapsed(false)
                            }
                            if (thr.menu_type === 'out_link' || thr.menu_type === 'in_link') {
                              window.open(thr.url, 'blank')
                            } else {
                              navigate(thr.path || '')
                            }
                          }}>
                            <div className="icon-wrapper">
                              {
                                Object.prototype.toString.call(thr.icon) === '[object String]' ? <div className="icon-custom svg16 mr8" dangerouslySetInnerHTML={{ __html: thr.icon }}></div> : sub.icon
                              }
                              {thr.title}
                            </div>
                          </Menu.Item>
                        })
                      }
                    </Menu.ItemGroup>
                  }
                  return <Menu.Item disabled={!!sub.disable} hidden={!!sub.hidden} key={sub.path} onClick={() => {
                    if (!menu.isCollapsed) {
                      setIsMenuCollapsed(false)
                    }
                    if (sub.menu_type === 'out_link' || sub.menu_type === 'in_link') {
                      window.open(sub.url, 'blank')
                    } else {
                      navigate(sub.path || '')
                    }
                  }}>
                    <div className="icon-wrapper">
                      {
                        Object.prototype.toString.call(sub.icon) === '[object String]' ? <div className="icon-custom svg16 mr8" dangerouslySetInnerHTML={{ __html: sub.icon }}></div> : sub.icon
                      }
                      {sub.title}
                    </div>
                  </Menu.Item>
                })
              }
            </SubMenu>
          }
          return <Menu.Item disabled={!!menu.disable} hidden={!!menu.hidden} key={menu.path} onClick={() => {
            if (!menu.isCollapsed) {
              setIsMenuCollapsed(false)
            }
            if (menu.menu_type === 'out_link' || menu.menu_type === 'in_link') {
              window.open(menu.url, 'blank')
            } else {
              navigate(menu.path || '')
            }
          }}>
            <div className="icon-wrapper">
              {
                Object.prototype.toString.call(menu.icon) === '[object String]' ? <div className="icon-custom svg16 mr8" dangerouslySetInnerHTML={{ __html: menu.icon }}></div> : menu.icon
              }
              {menu.title}
            </div>
          </Menu.Item>
        })

        return <div className="side-menu">
          <div className="h100 ov-h d-f fd-c" style={{ width: isMenuCollapsed ? 0 : 'auto' }}>
            <Menu
              selectedKeys={[pathname]}
              openKeys={openKeys}
              mode="inline"
              onOpenChange={(openKeys) => {
                setOpenKeys(openKeys)
              }}
              onSelect={(info) => {
                const key = info.key
              }}
            >
              {menuContent}
            </Menu>
            <div className="p16 ta-r bor-t" style={{ borderColor: '#e5e6eb' }}>
              <div className="d-il bor-l pl16" style={isMenuCollapsed ? { position: 'absolute', bottom: 16, left: 0, borderColor: '#e5e6eb' } : { borderColor: '#e5e6eb' }}>
                {
                  isMenuCollapsed ? <RightOutlined className="cp" onClick={() => {
                    setIsMenuCollapsed(!isMenuCollapsed)
                  }} /> : <LeftOutlined className="cp" onClick={() => {
                    setIsMenuCollapsed(!isMenuCollapsed)
                  }} />
                }
              </div>
            </div>
          </div>
        </div>
      }
    }

    return null
  }

  const renderNavTopMenu = () => {
    return currentNavList.map((app) => {
      if (!!app.hidden) {
        return null
      }
      if (app.isSingleModule || app.isDropdown) {
        return <Menu.SubMenu key={app.path} title={
          <div className="star-topnav-submenu" onClick={() => {
            if (app.isDropdown) {
              return
            }
            handleClickNav(app)
          }}>
            {
              Object.prototype.toString.call(app.icon) === '[object String]' ? <div className="icon-custom" dangerouslySetInnerHTML={{ __html: app.icon }}></div> : app.icon
            }
            <div className="mainapp-topmenu-name">{app.title}</div>
            <DownOutlined className="ml8" />
          </div>
        }>
          {
            (app.children || []).map(subapp => {
              return <Menu.Item key={subapp.path} onClick={() => {
                handleClickNav(subapp, subapp.path)
              }}>
                <div className="d-f ac">
                  {
                    Object.prototype.toString.call(subapp.icon) === '[object String]' ? <div className="icon-custom" dangerouslySetInnerHTML={{ __html: subapp.icon }}></div> : subapp.icon
                  }
                  <div className="pl8">{subapp.title}</div>
                </div>
              </Menu.Item>
            })
          }
        </Menu.SubMenu>
      }
      return <Menu.Item key={app.path} onClick={() => {
        handleClickNav(app)
      }}>
        {
          Object.prototype.toString.call(app.icon) === '[object String]' ? <div className="icon-custom" dangerouslySetInnerHTML={{ __html: app.icon }}></div> : app.icon
        }
        <div className="mainapp-topmenu-name">{app.title}</div>
      </Menu.Item>
    })
  }

  const renderSingleModule = () => {
    const { pathname } = location
    const [_, stLevel] = pathname.split('/')
    const stLevelApp = sourceAppMap[`/${stLevel}`]
    if (stLevelApp && stLevelApp.isSingleModule) {
      return <Tag color="#1672fa">{stLevelApp.title}</Tag>
    }
    return null
  }

  return (
    <div className="content-container fade-in">
      {/* Header */}
      {
        isShowNav === 'false' ? null : <div className="navbar">
          <div className="d-f ac pl48 h100">
            <div className="d-f ac">
              <div className="cp pr16 d-f ac ml4" style={{ width: '240px' }} onClick={() => {
                navigate('/', { replace: true })
              }}>
                <img style={{ height: 25 }} src={'data:image/png;base64,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'} alt="img" />
                <div className='ml10' style={{color: '#fff',fontWeight:'bold',fontSize:'18px',letterSpacing:'1px'}}>医疗模型训练平台</div>
              </div>

              {
                renderSingleModule()
              }
            </div>
            <div className="star-topmenu">
              <Menu mode="horizontal" selectedKeys={navSelected}>
                {renderNavTopMenu()}
              </Menu>
            </div>
          </div>

          <div className="d-f ac plr16 h100">
            {
              headerConfig.map(config => {
                if (config.icon) {
                  return <a
                    href={config.link}
                    target="_blank"
                    className="mr12 d-f ac" rel="noreferrer"
                  >
                    <span className="pr4">{config.text}</span><span className="icon-custom" dangerouslySetInnerHTML={{ __html: config.icon }}></span>
                  </a>
                } else if (config.pic_url) {
                  return <a
                    href={config.link}
                    target="_blank"
                    className="mr12 d-f ac" rel="noreferrer"
                  >
                    <span className="pr4">{config.text}</span><img style={{ height: 30 }} src={config.pic_url} alt="" />
                  </a>
                }
              })
            }

            <Dropdown overlay={<Menu>
              <Menu.Item onClick={() => {
                navigate('/user')
              }}>用户中心</Menu.Item>
              <Menu.Item onClick={() => {
                Cookies.remove('myapp_username');
                handleTips.userlogout()
              }}>退出登录</Menu.Item>
            </Menu>
            }>
              <img className="mr8 cp" style={{ borderRadius: 200, height: 32 }} src={imgUrlProtraits} onError={() => {
                setImgUrlProtraits(require('./images/male.png'))
              }} alt="img" />
            </Dropdown>
          </div>
        </div>
      }

      <div className="main-content-container">
        {isShowSlideMenu ? renderMenu() : null}

        <div className="ov-a w100 bg-title p-r" id="componentContainer">
          {/* 自定义弹窗 */}
          {
            customDialogVisable ? <Drawer
              getContainer={false}
              style={{ position: 'absolute', height: 'calc(100vh - 100px)', top: '10%', ...customDialogInfo?.style }}
              bodyStyle={{ padding: 0 }}
              mask={false}
              contentWrapperStyle={{ width: 'auto' }}
              title={customDialogInfo?.title} placement="right" onClose={() => { setCustomDialogVisable(false) }}
              visible={customDialogVisable}>
              <div className="h100" dangerouslySetInnerHTML={{ __html: customDialogInfo?.content || '' }}></div>
            </Drawer> : null
          }
          {
            CurrentRouteComponent && <CurrentRouteComponent />
          }
        </div>

        {
          customDialogInfo?.content ? <div className="c-text-w fs12 p-f" style={{ backgroundColor: 'transparent', zIndex: 10, right: 16, bottom: 32 }}>
            <div className="bg-theme d-f jc ac cp" style={{ borderRadius: 6, width: 36, height: 36 }} onClick={() => {
              setCustomDialogVisable(true)
            }}><AppstoreOutlined style={{ color: '#fff', fontSize: 22 }} /></div>
          </div> : null
        }

      </div >
    </div>
  );
};

export default AppWrapper;
