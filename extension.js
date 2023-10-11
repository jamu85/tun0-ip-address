import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';


function _get_tun0_ip() {
    // Use moreutils ifdata command to get tun0 IP v4 address
    // spawn_command_line_sync returns an array of 4 datas, where second element - [1] - is the ifdata command ouput
    // https://docs.gtk.org/glib/func.spawn_command_line_sync.html
    var command_output_bytes = GLib.spawn_command_line_sync('ifdata -pa tun0')[1]; 
    var tun0IpAddress = String(command_output_bytes);
    tun0IpAddress = tun0IpAddress.trim();
     
    return tun0IpAddress;
}

function _validate_ip_address(ipaddress) {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
      return (true)  
    }  
    return (false)  
  }  

var tun0IPAddressIndicator = tun0IPAddressIndicator = GObject.registerClass(
class tun0IPAddressIndicator extends PanelMenu.Button {

    constructor() {
        super(0.0, "tun0 IP Address Indicator", false);
        
        this.buttonText = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.buttonText);
        this._updateLabel();
    }

    _updateLabel() {
        const refreshTime = 5 // in seconds

        GLib.timeout_add_seconds(GLib.G_PRIORITY_DEFAULT, 5, () => {this._updateLabel();});

        if (_validate_ip_address(_get_tun0_ip())) {
            this.buttonText.set_text(_get_tun0_ip());
        } else {
            this.buttonText.set_text("");
        }

        return GLib.SOURCE_CONTINUE;
    }

    stop() {
        this.menu.removeAll();
    }
});

export default class tun0IPAddressExtension extends Extension {
    enable() {
        this._indicator = new tun0IPAddressIndicator();
        Main.panel.addToStatusArea('tun0-ip-address-indicator', this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }    
}

