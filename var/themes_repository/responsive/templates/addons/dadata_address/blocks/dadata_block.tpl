<div class="dadata-address-block">
    <div>
        <input 
            type="text" 
            id="dadata_address_input" 
            placeholder="Начните вводить адрес..."
            value="{$cart.user_data.s_address}{if $cart.user_data.s_address && $cart.user_data.s_city} {/if}"
        />
    </div>
    
    <div id="dadata_result"></div>
    
    <button 
        type="button" 
        id="dadata_update_btn" 
        class="ty-btn ty-btn__secondary">
        Обновить адрес
    </button>
</div>

{style src="var/themes_repository/responsive/css/addons/dadata_address/styles.css"}
{script src="js/addons/dadata_address/dadata_address.js"}

