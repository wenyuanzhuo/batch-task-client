import request from '../services/request'
import * as helper from '../services/helper'
import { serverApi } from '../config/global'
import { from, Observable } from 'rxjs'

export function queryPresaleOrderStatus(orderId): Observable<any> {
  return from(request.getInstance().get(serverApi.orderStatus, {
    params: helper.buildQuery({
      order_id: orderId,
    }),
  }).then(response => response.data))
}

export function setPresaleDropSuccess(orderId): Observable<any>  {
  return from(request.getInstance().request({
    method: 'post',
    url: serverApi.setPresaleDropSuccess,
    data: helper.buildQuery({
      order_id: orderId,
    }),
  }).then(response => response.data))
}

export function setPresaleOrderStatusApi(orderId): Observable<any> {
  return from(request.getInstance().request({
    method: 'post',
    url: serverApi.setPresaleOrderStatus,
    data: helper.buildQuery({order_id: orderId,}),
  }).then(response => response.data))
}