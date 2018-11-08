package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    ConcurrentHashMap<String, ArrayList<Point>> poligonos = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception{
        //System.out.println("Nuevo punto recibido en el servidor!: "+pt);
        //msgt.convertAndSend("/topic/newpoint."+numdibujo,pt);
        if(poligonos.containsKey(numdibujo)){
            poligonos.get(numdibujo).add(pt);
            if(poligonos.get(numdibujo).size() > 2){
                msgt.convertAndSend("/app/newpolygon."+numdibujo,poligonos.get(numdibujo));
            }
        }
        else{
            ArrayList lista = new ArrayList <>();
            lista.add(pt);
            poligonos.put(numdibujo,lista);
        }
    }
}
