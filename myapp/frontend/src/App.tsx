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
                <img style={{ height: 28 }} src={'data:image/png;base64,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EYA6ZJhsi9itABxH3Ggdoo34ZEsU7glgOzu5T/e+U336pGGRF8t+60nq1jn5Hz3ytx7+u7r/OYJJVXvwz/Fveo0GdX8AHX0AAAAJcEhZcwAAFiUAABYlAUlSJPAAAAXtaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMiA3OS4xNjQzNTIsIDIwMjAvMDEvMzAtMTU6NTA6MzggICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wNy0yNVQxMToyNDo1NSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0wNy0yNVQxMToyNDo1NSswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDctMjVUMTE6MjQ6NTUrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZTFjNTJlM2ItY2NkMi00ODc2LTk1MTUtZjVhMmUzNTJjNTVmIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YmQ1YzU4NTMtYTFkZC0zMDRlLWJjYjItMGViOGRjYTA1ZjJiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTk5Zjc3ZDAtNzg0MC00MjJkLTkyZGItZjNlMTAxNjUyMzE5IiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRpc3BsYXkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmE5OWY3N2QwLTc4NDAtNDIyZC05MmRiLWYzZTEwMTY1MjMxOSIgc3RFdnQ6d2hlbj0iMjAyNC0wNy0yNVQxMToyNDo1NSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmUxYzUyZTNiLWNjZDItNDg3Ni05NTE1LWY1YTJlMzUyYzU1ZiIgc3RFdnQ6d2hlbj0iMjAyNC0wNy0yNVQxMToyNDo1NSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+a0VZ/gAAKNxJREFUeNrtnQlYFEfax2dMsrvZe5N4iwp4AYqC8b7vIyogeKKiURM1JvGM8Yr3HZNojJp4IgqC4H2ieKF4g5wSBZRDUGOO79vdb7Mxke/t7hkc5uiZ6eaoYv7/x6e3tjPTVNX7/up9q7qmW/u6ex8NBEEVQlrwDEHgGYIg8AxBEHiGIAg8QxB4hiAIPEMQBJ4hCALPEASBZwgCzxAEgWcIgsAzBEHgGYLAMwRB4BmCIPAMQRB4hiAIPEMQeIYgCDxDEASeIQgCzxAEgWcIAs8QR/Lq7iIVqtX926MH/1OQ9QOVH2X9hJ4BzxBP6vOud5/x3hpNIRna6Jhx6/G9+PwTX8ejl8AzxDzJ73j3Hu9l9WMZtx6d2BKfcasAPQaeIZZh9rb98ye3xJ/4BoEaPEPsafLmfvWbVzOTYcseKUqfBNLgGWIsMjcX02wjWiUVyp//sMVWdCB4hlhRPe8akzf3Vfz1k1sRosEzxFKmXa95dWthWO78lBZb0I3gGWJCn18fb9ec2fQohuhb6EnwDLGQbPcT0dQHX/vLGTfzN0w8is4Ez1A5q/c7zXuN836RPxvm0vaUp7ZCyg2eISZ4bq7+OlNbfoPOBM9QOasX8Ty2uVarT58LNcrK01qBZ/AMlX98flOKz+rSbc20ll+jM8EzVP767No7+rVqnXHtLWfG53818Qh6EjxD5a/3Ng1w9a6u5gobJx7JiM9HT4JniIEp9Pg3e6pYEsuML9g48TC6ETxDTCH9prL9JJuE4PwQfQieIVbk6l1z4sZ+Wj2nhZpCG8vR226e2nITHQieIeaQnrSpv+7/2LaonZlAmfYhdB14hlSB59q8uqtXzRcz2ISHmbcKMlUnvXRlyrptXBujyBxdEpFZao6u7FWzpNoCgWfW1XN8i55j35T2bxgeJWUl5FPqq56ESZt8XLxqmF7f8MxpIc2+ob45vca9afb6dMy4lR+99SbABs8VMyb3GPtmveY1CgsLtVqtzDEroUA9BmLMrOHSrIbRX4zeeoNQi1ZNsjhdH2C1LdJfpObAAcBzhYKZvN+ur2yadJjZyCZlGbZ/Xkzsb8ANwHMFgXnCVwMUbN/azCTSQnNobLKzLae33hRSAwg8864JG31dvWso+GJmfP7mSQfZg9lH2XdPb7uBKA2e+VaPcZSatlD85JAzxABLYW3CV74u3jUUPwXlo7YbixbPIPDMn9ZcmaTiKUDCcWabr1iaOPiqacvFkIRTW67/8uxXOAZ45nLm/O5XPuYmlMUMIX+e0tTTbIRoKTjbW38jrfMNf/j4e/gGeOZw5vyVXxEACmnW8Xy93LzE4Pa1YXMU0qzRhI07mZiW9RxpN3jmj+cNfs4qZpvSMTM+/+vJB8rTUcQ7yVRYFfeeyrbQ8dIX8Sf2X//119/gHuCZM62+MlnaUyFtmFJWzrr1cHM58yyA6OJd650NPirbQuU7x+/vWHocvgGe+dOquMkm8ckwG7XpfFZ5x2fSSy9VquNZw2QtQEm70sEzeOZU73410MWrhpkJpT1lkef95d4WQnp57CSVbSHFros/Gh4H3wDP/KnHuJbdxrRU+oh7XZl4/oYBnn/3ysuLz09Q2RaNOH8+GgGewTOXPLfq9nYLrfDkAClEFSoof/3egayEvHIOzpUq/fb8efdxLXu83UpNW6i8ZVhkZjZeIg+e+dTKy5NVPRRbo/243ZeMtKX72Jbd326lpi3fXngQPO/Y8+fP4RjgmUt1H9eq+9stFX/9zPbrZ7ZeY2h4intf8Xef/fzrat/gf/7v/8ErwDPHWnFZOQOzmQnO+hBNMwiFw9O2iQcykvLgD+CZ8xAtMNBKwe6LbybvL/eZs9nmdH8xi7b1eCUi6dC683AG8Fx2cvGq5eJd01l4rJfWxatGVkK+5I0x266p5EpC2i6iYyjT3naNzY4av8FfvA9na1t+/eX50r7f/Pc/z1Rax8mt6j+q/vmH/H9+l/vj09yfnj78qfA59o2CZ3O8UYdYyCQFj8xKeKiSanLH8RsGWrq+0aktTEZmXXW12t+98rLvxE7NBrtbqr/heeq6LZOjSmI0NL7+b89+fZL9473L2Xcv3H/y8Md//fvnQgfeFg6edepG7jKmlS2fvE+u+X6UGqTJL50NHutpqpgd12JYDcuGeuXllzxb1Ov8TsvX6/+j9JpjS49J+v7ej8eWnsvMKXj27Dfw7Mgwt5bG/hd7HgxvtZicz4onpCNV5o3C3327NV2TPFUr7AB7mHVbiMYx267y1Xuv/uH3Tq5V2g73/kuVP1Z3q1LUbzHbr2mFhzFcVdlR4zb422gXKn+f8WPoR0cLnvwAnh0YZtsis0mUjtRApbyWMe5Lf3u/9fTuD+vG7/ntt+fg2SE9ZkOAsn0RMTuuMh5LX3qpEtduPf7LAGchkbF778q18KRDX54Dzw6ncesDnL1rKv4h79wO61huXSWt1qV2tXaBzam2r7u+JtU5btet1BtZ//7Pz/SB5wyvDFPe1HV0K8U/sz67/VrM9qvg2YHk7OWkIJ0z1Fm2QzQ1sEGL2h1HtTA6n5f8KHpbXObNHJats+zSlApsGvBcGsF5kLBqKv3YXtcfdpfntv+C2QaOXT/IRVoWNlf/uR3Yrbk01KqxC5XnMdxA8FwaEWCq6ifnaLe+H3k/IZfJfLVNV2Gdz2LNz+64wmwEG/flIN3MWYV1zgr3ya6AZ0fR0tgp6i9Ced1ZJudpY6XsQ1bMRjBbKs+vacBzqWR0Y9cHlBDPLAaBpbFTrX5mXofPGea5VkU1DXguLZ7VZtts82y1/vNZ5fltYeZfS6V1zoFnB8u3p+mL+g1H9pe3fbCPzfmz2Dq5+t9PyNv2QYThs7XLV5UqaYvun41dP9hg/qzQRojPjqUlF6eqv8j2DyLv32aR586jWnUb11bmA+d2XqUIxs6vFwx3v3R9u02X0a0rqmnAc6lIdJo2alK6+7fztn8QwWbrXn75pQlfDa/qXtlSzXdOiWTqoT+vvPLyM/1LrQTTjGmj8ubD/I6fOZpLOzrPnUe3UTNDO7/zCssZXQOP2n2ndX2t/mtGNadM+9Cq6O/zf2KqtpW0WsM34Cy5OE0NztTG7R9GgGdHQ7othegXsy7DPQmGszEL5+d3XMt4A//65z+6v+nSelSLX3559vN/nz1IzK1UqdLl3Tf+8/N/2TeNNNoqsAv9z/b3Ixwt2QbPGudmTmPWDzazyahQ/xY2y+fP7bxyjqvlllf/8HuaoFaqpP35v79wUeHFF6YpsItuaWC7Iz7fm1eeicOSGn27iCHa3m+JMOOJ8GUy2tqpB0KmHe6YPcYTz13GtKXRt3OQjj1pOH5wO+/cjrgH6timK3cWkTa8eSNTPrfjCv1R8FYGqktIrxtso12ofH5nCZhG8DSNRsj29dcnN6Opyv343Ads5/B88CyG0LYy6x/ZCblnd1x5cFv5D4acm9UevX6wbWtgcYjMZYt07a5j2tTxcrJqnXOqTVMGnuboPI9ZN6ROs1pafa9K70wxW86+nbdDXaJFA3MnYQ3G/PUv7ERYLs9ATdap26yWWR8QBlnVpiFPs3R9o/J5Vj2BaZ5pYKZcy7650+3cHarnTvR3nb1qkQMVXVOYMINkNlxCSKZE6xSlvupNo8DTSmQEcSyeRwvjpZO936KOPg/2IIf0NHZ5Hr1uqHMzJ2V7Cc4JHX0ZblqmnsTMPvCy9LQFndaAZ5vyn6AvBmv1MxYFx0WdP2XfkzqPads5qJ1U5/u3c7IT8zgdhmpWfb1ywyr/cH2tY1AbrX4t4+DKEz89+h/2E3g1nnY++DJTIZpRnmnIrNvUSc3e3fPBTIdociPK8Uxr/iAhd+eUvXzB/Ooffu8/tXe9Xg1MrUBtYfwGj3pPW9h5DXi2ogXnZ6q8ArlRMMNgBH0x1NKE7UIwZ5OF+u61h28cYum/7vkoMuP6fWYrr97TYrbEXtpzFTxb1N+q/nVqxAQb9w/IlBd1Xs1wjjdUpv7nd17mCOnAxf71O7nK2IJxQ6jxMdLZLRdjwbMsz3+ZEj6xsLBQq9WqOQYLyR6L9/2DvhhWp2ktmZoTzxd28sEzJdszT3wgb4tdU8PZNITEs0pPy7iaFTo7CjxbVG1PpzHrh6m/Dss8y98dEScLYfwk20PlP3MhmNF0o/OYdp2C2qm8yM///HlV//XgWY7n0cSz3OtHbTq/ayqrPH8+rI4Rz8Xrn008T+WD58YN6w7cPFjeLswaotNoPc/2+JXR+XtXMsPmID7Lzp8/DJ+o/jqLO69ik4GgL4bXkY3PAs9TQrng+S9/enXqsQ/kP7NrShijPI9prz4+CzzPjgTPcvrk3KxC/Q0B6V6f9Et1cVi06Xz27bxdUxlFotPo9h2D2srU/0LwJV7mzyS31vUHrRhoyS5E8i5Wc406zWqP+nyYXX5lej7jSlbYHPBsJSMdXruZk/65E9K9e/vKOULKym6IowHLUv2z2a65+ay7XUO/pb5mbbG4y0qWay4aQqGPSeWdH4TmJOeCZ6sRTFUiRDEh+za771srigzc1dySPNs38lniY3gmITL+6FenGa+2Sk+jwZepNJDd/dvzz32sopdzdjEf4uo0q0OTtzriD4Y4qraM6nvUqede+zXX16n8Q+b3SbFp+Y9/KGR+V7caTxMH32zwbF0daeAc1d7cfzF8Zrr58yHUy4nZvGBQp2mdOl5OF3de0kDl6WnW/crofHZibghj4y/Tv5fsNLpDh1Ht7L2/HzKNrSETKqXsRgKtRGytwNMe3M4OYS+ZYv35JJajtHld3HUJga4CB1LhaOIP2Yk5F3deVpmR2eVp9BdDmJwZcfC8IUpHqa/rNK1t9ZPUxRyl2ZA9sHWwCptI9SU1DmDLX9HHjFg2O4qb53tSX9f2rC2sHpn8Zi37dk5OUg6zXQypNX1Qhw5B7W389WJsiFrYZDwtNvjSxWCm3Yyz529TrBaOXi9iNTCu8JG5w6j2dj1j4OKuWPVeIXma5GzZCTli/Ocg9XP092NArEfmUR2E4Kj7gaLWxrL6KM2pwLOVRICjsbnimWDE54GKv76s63LwDAnqoAsLL5STmBMbHMsd1a/+4Xev//2vnm81bTa8VdHJ7x58t29uxL+e/uvXX39jufIjPhtR24ZFUEuK3RUbGxwLnh09JgR+Fqgx98ZCIYvbdSk2+CIvbXnppUrVKr8WtOdds225vDvuyu5Lv+jft8yg5sTMNaqzveXl3ZaDZ4fWiM9GOnk6abVmFk+lXQR7pu3mKEqLIa6OYf0NW7R3ZmhWPKNP9hIH1hGm/W/JLmbPXwrhafwFz6XkQ1azuIsVoznRX0bfPHiD1SlPR6Mpj9KUGzw7qgLXjrRlwrai+zJOVgE6th9pBYmVPZaz+XsJG20hr0sh4NnBedbvCpY5rui+lB+eO3LaFhttIX/MScreMy0EPDuoJAD0OxN0z6DQ6tdXpDJNnkOnh/DSnHYjOxjV36hdzPLcnvJtvS1k6i9/PjcxZ8908OzIPI/qJP/A5ZzEbF5cpHbTuoFrR3DaFltsYbV8KeQi8m2HFoWF9iPkctTQ6btzEh9w05xRREVHHtsiX3Mbj6EzeDIWeC4VfXxmvuX1lYuXgi/w1Zzha0fV1m9F5qstMoawUSu7L3E07wXPZoNDp3YjOxoO95dDLlJ2yulgT80R1wVehC4B5l0XuLOCXUcu2giey3T+KRUqRs4mNYevtnx8er6maK9IYaFd5ZXdFzug04JnqLhDiM/TYSpEK/hi2IwQR5s588pzUdisSMGz4iU1JWUaEelOdn3lcsgFB8y0OeO53SjBqO1HdiqKHUWvEMpNzCYTAuzyDaRt9dQZvvIpLzH7kmrTtBPm/2bsbrZMnnDZUWHmg2ca8p2a1mk/srNun71uz4BxmZwmbEYw0CpzkjuLKbFFu1A5LzHnUsh5NVSTD1CUFoO/RR8Q1ywfOPiwzjrPNDa3G2FrupWblE1jc04SAnUZadinQU6edWxNg3erjZy1PetKaZrRH6UrC0cHDst88Ezj8dA1QfberNg7Mxi5d5nAPFrgyh7riMnw+RKbqAs7tGFoTnh28qw79NMgBV+kKL13xk6YtlQ1VILZfu2dEZwLCB2QZ/IYyq8M99nbXr68+3xJxYFSz0E8nZ2a1cm9nS38foATR283qnPbEZ0V2EUqr+65kBc8yDpSnXOS7oNnVcF5yJogpVsJhPKnvRaxT0WbwE6Gdc5Lpvn/efapnhm9QLFdqBxHWXfIeQ7GrMBOhvWneRz7pmGUZzGdq6vmCnFsh2gpxPFYcydPZ2XzIIMJ0QPGJ0SW3C+O+byPUZ5nRC/UmN2kZHjDUfY8OU34THadZsaphTL1/7QXuxnpkDXmfN1mu7DfwLYjDYZak/oT0nEMJxcs8vzXKn97d/c0dT+VE45rei5gdfgfU8uzrkzNaf4ft+scoyNR9CKVdqFj+IyduazOSGdGL5Kp+RUhRJ8Dz/bx/E7INHEdQupHrbIys0GAQpzIs8X6x+0+x2wQmH5qoUq7UDlCmIuyyDPNJsg6nPoV0zyrvw7l22w6zYxTi6zOMMNn7mB1prCoApum7cgultY1DCYLC8CzfTyPJ55VPUpdKK9ltd/JadpITmOh/nmJD8I/YpTn6ScXqbSLRojPO5mNz4PXjJapf14yu0MtyzxPV3+dtb0+YZjnLjIfiJi5g9np5fRTJfC7Yn4bmCekTtvBs71BYLHt7wc1e3yYlB3+Ebv9Pnj1GCf9XgW+at6GMtLALmqsQyRHfMRuiKPRtnVgZ0v1/6w3u8k2uzyLfdrF3GtMiu1PkDlPHpPL8J4eMa8bY7b+jNdc4JmSC6V2oaM4m9jOMhW6BMqk/leEdcpz4FmJuw9aPUbNFT7r/YmGeREbbQJfJN5X9py7wra7SJp2UlXKvY/tAavIAwnpWvo77byYht39221GdjX0dbsk9v5ZDSci18nlZHuwetPQ/DPio20ayNF4Jk09uUSX7thzzEvO3gePKW2kR3RpPaKrvdbJS7y/b9Z29J6D8kyBK2D123btPcpNegCYTcOprj+bOFMv5SXfz028n6c6Ixi8emxN2V1upseIj7bncZWJgOcSVi2axgR2rWXbbzOuUpq9+yyMqg+hAsatLSfG6ruL/kRr2xJvSrP3zcI46/A8Sxq0amytps66/2PhXv/V3WcBs2FMbh3Y1ZY9HvuEmJmlYsB1EdeNnGX+1tXQsxwtZ4DnsgnULhSlazVxFmO11mDgv08J5FWQbKDWI0SYjWUIWbHzFKhVdiBZhwK1QHWx+H9WGmdhEfBsxXtEkrNgP1MFrBrr5Oli7x6PK3tiAB54rrAqSgco+NPcj5exQ4jMw7taCMMa+fORs7ZjiATPFTJf7WaUr1JWT9kj++4+5cQyxd+lBl7dHcOLgV7MtjAGgWcZfXjcIhJRs7blJWex7OWthndVc4VroawjbbaN7FcbPJeru5jshZDe0sa43wSsGkfThEJzezl0b5mzdv6aMIuO4cg6RfVnvObgubyC83L5D0TN2spsiLZaeVu0ru8cRlc0mrj4rxrHY83Bc3l6jPyzo6+GxlxjMg5Q5QeuGqf4mdhF5fV957JpnVYjurUe3k2m/tdDEaLBszHP42Xeq0bla6FnrrLKsxi+tPL1t1pez2qUI9NQG2XqL86GzoBn8FwsxGlkX0y6/2NG822h8ivHWXmZqg3l9W+xyvPK8TWbOMvU/2HK/ahZW8AzeH6hD46vkP/A/llb2OV51Xj111nfdzar+Xb3VsO7yXzgmjAVQnwGz4ZOE9i9pd5pTMPAw+T7+z/+htnKv39shcrwnMdwA4tMY6n+Bz7ewvLdRPBcflSId0FMjweEZDuTx5rbeMxLymJ5wKIQ3XJYN7M1v7bnDP2D94JnY9Vs4kKhQDdVK57OXWfbY6QIpnvelYlsOb//4y0P2Q5xA1e+Y2Qaqv+NsBjADJ6tsEFg0z/yb/rHi7u8f2yl4u9SM1kOzgYDrmurwG5FdRaGWsAMniukWlKIHtZd2UulDsym4JyJPgTPEEPyW/lOrSauxX8Rabjvwvz5a6GnryPKgecyTrRqejrXbOxiePJ6aAyiijHSK2iS6WL756+HnQHM4Lks08gewrEok9TV3XAvQRZ5JMA2QPrdmp4uttykuh5KMJ9Gj4HnsoO5BZFsg26EwTWLpTMth3evYTlQo7vAc9nHmQmUOtq+rHM97DR81ITqHvqyi7Qg/DAl82FSFtIZ8FzWSWP1xi7a4u8QMv0Zr9H5m3sRdiDwzGKa3UPZdw/O/hrBBwLPDGWJPsvfVfz1G2Gnb4RyEKJbiJlwzcauRdXmehgybA7vbeG0OYzy7LdiImXa0rRYyqLtLd/Ye/rGnmiWu75lYM83h/Ywqj8NQzdCo/n0/p4CAAZtyU/KuhEWzSPVpm2hckFK1vVQ1pvDKM++yydWb+Ks5n3uN8POsAwGuUuLYT15rLm99trYfyZfbaHccMDyd822hWA+NGczeLZPf6n895HbS+CpN8x6kjibmCDzAXIajsKaEM0sr3SIcx+ehicam2Rv8jHdHEZ5HkE8m96MkmTz+U2s8kwAFGXaZut/kysGfCQALNtl0wBuQnSNxq4+KybI+FV+StahOZvAsx2q7uHiu3KS+uts6j+DYQBcZT6QL+R1m3hhYOKRT+U/QOlGfnIGHzw3qSefOrHsVwzzvGJSoX5IlGYvCsqbBzDa7wOI58YuMvV/mJJ5mB+eJxxeI2+Lw3O+zk/hg+c3ae4wtCenfsVyvj3PdK+IvWVmx1Ex3+4pU/8bYdE3Ocu3XWVscXguP/G5cT3Kt2XaUpCSiXxbwZD/qcor5DMc4shpBsgmdYcpQeUkoEkxTRieODSE5ezJ4mzo5l6mh1pmeV5bEjxvZJiBXpYYED3mlIYrDVg+yRIDBDNHY5N+tJ3Io1OxyzO5e/MhPcTb+dLkpdDe8pG5rIc4s228RZl2GGcw65BeNrF6k3qGbSlIzsxPzeRubJKQpqSjuoeroV/dCudgnGV3//a7h9fqpy3S3Xw7ykQy4+Nokd/U8HSlyEYDvxCZQ7kk2ag5LxINNAc8vwhfw3o1tzwrk9eRuZzleBBUwXnWZ6S97N1PcmTuRsAMgWcW1X/Ze9Ubu9r++Vt7T90KOwW7QuCZ1Sg9rLf30J62/AYjfm/0zbCTMCoEnllfmWg+rJe43ijd4DfOum+FR98CyRB45uv52wR29Sb16KgRbgYKk+SC5AzMliGIS54hCALPEASeHVvVG9ev0cQ1X3iuQGEBzyl99cb1ajSpV92jHhWoIQWpGVyvNTQf1ltqi2iXTN6bA57LwmO8h/Q2PBMffpJTpzFti7DokJJxa++pgpR73I2w/Za+Z3qemnN03gb4LXg2I++hvemf6a6VguSMY/M3VIy2SMetvlP4as5bSydTZDbblvi9J+kfvBc8FwdgWB/vIb1MNp3pyvHhp+LDTnAUzd4Sopn5tlCZkg6OmuMtJBp9LLWF/ufYvA3cZRzguZQjwJL3qzV2NdqpInmMVN7q9yFHPPdd8p5R/Y3atdVvCj+mmUwtsmQXOibQaLv3BHgGz4YBbbL8C7LEvI4PpxFyjcG95V/5xdHwNO7AOvm2xEfwlG6A57LQWHIaWR2fz01S5z20j5fJSpiRtvHDs1XTJISfRHwGz0ZOs94az1/ywrOYb78v84FHKRnH5q/nZv4sDE99KoZpwHPZOU2zwb21Wq3+bZWFhuXHqZkcAUDyGtrHe0gfs22h8vF5XxakcgNAdY/6fZe+b6ktBSkZx7kyDXguyzjQ1+wUjccIMPbAl2bb8iiFxqZ1vJmmrziDMDOBJpgRnMGzxbDmNbhYtyREnEjgc25GYY2aU82jXkVtzqPUDMoyEhx+5gyerfgNDf3VGtcXPCb5Hkd5qaW5NIWxak3qV4C2FFlHt88HYRk8QxB4ZmuErgBxBoIcl2evIX0pAa7mXmwH76O0jIS9xx+BbahEPY28q9mgPkWe9iglg47sexofPHsN7dtscF/5z9yOOE7dDV+EStXTHolrb49S74Jnheq9+ENh/cMGUQZ+8pN1cEqotD1NCB7hx8Gzfarm0aDP4g/0zwA0eq9NodnzBSl3gTSk2tOs+1tC+LHb7CHNNM9F4+VzjaaS/qTVckLE8dvhSLwh+zytqkd9231MKiey52ns8tx78RQbkx9TiUgfg5tCtqjZkLe8rK3O8OJpjPJM+U+vRR/K/z5O/hgc8B4XntSUPEms8+OUe4/S7nE9DAnNGdRX6v/HQluOM7tuVFKelgiebQvOU6t61Kuk0T7XFCo7JrIdosUJ2xTTmhek0vz/Cy5JHtyXOyvI1Nz248l5nz++kwGeZXleNKWKR30V4VmTtI9pT+q1aEo1j/o81txSiLNki9v7jicy3Bz1npaw53DygVPg2aL+/MY//L9epryD9cdg/0kMAzBFNos7xhHSvRdNrSruD7c895nEbOWDojaq9LS8+OSY5ZvAs0X9iXjevEz9dXax6kZNhXnmWzIfSNx3LJEfnkdFbuTUELZU3qoe3kqOWQGeZXkO2Ly8UP/cRnEQVFLeFTCR1WR7WlVdjme+/o9S755a8DkvyXbPRVPlbRG94AtmF8ZGRW5S42NUfvbv/wsLmg6ercTnF6+R1Jrc0rftPLvxefBbnoPekqn/o5R70Qv54Jk0ct9GebucXsgyzxvt9Suj8/nxiM/WeV5u+IRlQ9l+ntn43HRIP9N827D+0Qs+Z/9Oj1G6IWOXEFYNURSf7fIro/Nivr0RPMsP+WoHvMepFOI+YzimbeK05ubSjX6elpcDKNF4zPDY1HOhMBipuUJC6KGUAyfBs5UI5hnQT82qo+hG3zLNwOB+PNbcLnslRR5NDD/KY83t8LRPPsX9Z7uGfKnz7CuHDJrIOANVPRpSG6vpgoNQ58R9x5Iijmr4VFWPBj0XTjW0BS/NEXMlJT6mEX8+eZqlZIrd/dsUvpoO6qfsu4n7jvICBlGtEVaJ6ydyS7Jpc8RZAzcphhg8FHoaa8kU07+vGrlvs4L851Ha3dNczT+hclePhdOquTew19MSI5kLG0zz7Dm4v70h+lEqwby2pOIM5ZDSWg53E9qKraIsoKRMQxfsuXBauXiaA/EsdLR7wx5CR9s0YD5Ou6e+iynP9wzob3r9x2nfJkUcoyNwKsfxvap7fXIJU7tTnFRpGrs8LSnyWFLEEQa7iIPnDYnrRv2qeTSQv78vzpmPqHQXSgfk9w9QMp+07yjCddmT7BnQT35fx2MyjWqqeyycXszTzPmbek9zaJ6Lhk/hBo9QaGB4nqwoGlJt/5Ihja4so6RIdi1aUWEuM9NInmbqDCXlaeDZuLsNurhk4mSPhTNsh1nvN0eAdFnB3L9cTFMangaeS13dCWa3+ubSOCvHMwvXYjpdqmoyqL/noP722oWOSVFHkx1ytHV0nsVVkOmKfwC7Z/A73OU1vIxBVOHuC6cr3ri1mx/TgOeSC84L7M60jVK75H2sxwEhyhmkrDQJpDqzT7UjmAY8l3QEWDBDzd7dx3funlm4hu3ZxMyqbmZ2SiRFHUmOOMxyzQMjtqh8csieIePBswOp24KZ+ghg+Ks4+8qhDDsNReYmAQMs1T9ZiGCMIl1FGmpV2IXKZxatfeJgCxzguYHhPnutRltobv+9zPnTi9Yw6zTDw7fI1J9lnpsMGiCORMrtQudZbiB4Lh13V/3UQWadRghxn1iZTYQOZTS56PbJzKoeDVRaJzkKPDsWz1vVXyQ58jCrPDcSU1Y5hQ4Zx3Dq1LCimgY8l4qG7S0BnmMWf/okLZ1Nnrt9Isfz47Rvzy5mdDGv6yclwXPU4RTw7DjquuAjce1Xq2DHQtExRpg/p7PZQGHAslzzx6npTPPs0UiNXehI+XbKvkPg2VHUeNCAJv4DNOLaiX5V1O5y2NCxzDfQfP3Dho5ju+Y+auxC5RTEZ4eSmJHOVHMFMWVdzfaY5aNH2miawG5aIVNtO6dCTLcRPJeC3wT4NA4YoOjRUYLOLuHAY2jYojZWcdNNR1P2H+YiCx26d5tiu0jlvcPGOpo/OzzPg3wa+/souyVCJDMenPk3zQDFN6wc0zr4fZUQoj38B2h1sy9bj9+l3T27ZBWoY80uRcezS1Y7WrINng2zbh+7AkCJuAtlwlU8GkrXfCI+84R3F6QWFZXVt0WBXaRjyv5DjrayDZ6LySNASryt60nat+dUR2aZP0fXT406xBfYlpqjvi1d5s+qYueN6JSoQ6mRhxzTjcFzsdji4e8r7z2irxxU5/q+tgwc6v9QWZFsvTki1QcVU21jj/HVb+C5jFTZrVHjAF+ag1V1b1RYWKjVaumYuv8wpXHqR31yTY+BA6RrWj0+Tks/z/AUnYY/d38fw16SP1IfKibNxn5LiTrosJEZPJe1usz/WJxeFpo1hNnzLEebIWE7rNbf6LzK5lAHiuNIQ6PrU/x/cifdkcMyeC6HvNRjoI+CL6buZxHpzjQ2uSnZX31uyarv7qhaGqAESpcgeDR6kpqu8mrgGVLggm5d5s8yDlc2lyOGj2ZvbPJV1pbU/QcRSMEz3+okRLOiGzl2P2eDQnQaSwwMCt2puC1UJqTTgDR45lcEgP7mqO43A/aW2QnRUq6hpi0p4Bk8c51sd543q9ieB8Nc1Lbz55fStPMOE7nGPH2uYU/9Dc8/SUu/sHQlHAM8cyn3AD9htqlOYo56gI25w2yDuYNC7RseBMcAz3xOnufNrqwagDTiOYoJngP2BKu/SGQgeAbP3MZndz9fG/eQWDqmRh1gh2eVbaEjeAbP3PLs7+c20FfdQ0Q1NOFkZP7sTzxr1D4WNQo8g2d+eXYf6KfyIheWrmBmPWyOyunDd3fSLyxdDscAz7zKf/culU/5jgocxUhb3KThSUVbvktLv7gMPINnbiUyMFCj/7W9qZvLn6eAdpGlgOa/J8Su+hudp7YwkmuAZ0gpz35+ikNa7LIVTAFAzXHz81PWlqd3EJzBc0VAeiAhrWA/Sdr+A3ei9rM3gwhRtp+EYEZwBs8VQR3mzqns5mbn0tGdWCajGQ1PFKLt/dadAyyOTeAZUqI33NzdBvrZjvSdA/vVez/90crujd5oJPxR+tNSbLyz/8DTO2klgfRAO8emZXAD8Fyh1H6OLkpLL2bRmcGkTKEsff9+lbw18vWzdH0pWqr8E40G6qK0fFtK5G9B4JndQN1ooF8VNzezK0bpJRGWGwnT9YG2rFHRhFZNrJZvSwm2CALPHID9hpuQDD9N1y0RlUgQaz9nrl0TdUrsVf5daogwiIixuiirp0Y9vZOuPrGHwLMj5/PzKru72XsriWa2AA88Q2yp0UB/MUgquTd8cOQIdCB4hhiSX8gexbtW0oWsOwp9CJ4hNmbjjdzbz52rZmf1wZGB6EbwDDEyc57/hp37VYyUfiAKIRo8Q0zIZ9cedb9K1qYfjPoWPINniIVku92ceVb3dciXv7tz5/LyJehM8AwxwbP66xwaNRydCZ4hFnier/IiT9PTEJ/BM1T+ep14nj1fnAjr58O6ZFp8N4Vt55/eSYtbAZ7BM8SABuwKU/iCLH35aXpqHOIzeIZYUNvZ8ynrVnOFyyuWfJ+OXZ/gGWJADf0C6J+a/SSHRw1FN4JniBX1D95b/H2OhrJy/tuDkXcPRKIPwTPEihr4DWro668gNNPM+cqKxehA8AyxhnRAQ19d1l0oLmbbUo4TZs6p6D3wDLEZpQNs/3zcisWAGTxDTCPdwMc60ncP0Zx5H7oLPEOs6/VGHg18A+hYfA+JrkwkCzwDZvAM8aU/Vq7yp6rVDFfAvktJQreAZwiCwDMEQeAZgiDwDEHgGYIg8AxBEHiGIAg8QxAEniEIPEMQBJ4hCALPEASBZwiCwDMEgWcIgsAzBEHgGYIg8AxB4BmCIPAMQRB4hiAIPEMQBJ4hCDxDEASeIQgCzxAEgWcIclj9P/rge0pKJXXlAAAAAElFTkSuQmCC'} alt="img" />
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
