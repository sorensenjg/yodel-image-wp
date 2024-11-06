<?php

class Yodel_Image_Utils { 

	public function __construct() {
		
	}

    public function console_log( $output, $with_script_tags = true ) { 
        $output = 'console.log(' . json_encode($output, JSON_HEX_TAG) . ');';
        
        if ( $with_script_tags ) {
            $output = '<script>' . $output . '</script>';
        }

        echo $output;
    } 

}