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

export function setPresaleOrderStatusApi(orderId): Observable<any> {
  return from(request.getInstance().post(serverApi.setPresaleOrderStatus, {
    params: helper.buildQuery({
      order_id: orderId,
    }),
  }).then(response => response.data))
}